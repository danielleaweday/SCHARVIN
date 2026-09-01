"""COHEIR™ Portfolio Uploads via Emergent Object Storage.

Architected for creators' lifelong professional resource library.
Supported: mp3, wav, aiff, flac, mp4, mov, pdf, docx, pptx, xlsx, images, zip.
"""
from __future__ import annotations
import os
import uuid
import logging
import requests
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, Request, UploadFile, File, HTTPException, Query, Response, Form
from pydantic import BaseModel

from auth import current_user
from models import UserPublic

log = logging.getLogger("uploads")
router = APIRouter(prefix="/uploads", tags=["uploads"])

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "coheir"
MAX_SIZE = 50 * 1024 * 1024  # 50 MB v1 — architected larger later

ALLOWED = {
    # audio
    "mp3": "audio/mpeg", "wav": "audio/wav", "aiff": "audio/aiff",
    "aif": "audio/aiff", "flac": "audio/flac",
    # video
    "mp4": "video/mp4", "mov": "video/quicktime",
    # docs
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    # images
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "webp": "image/webp", "gif": "image/gif", "heic": "image/heic",
    # archives
    "zip": "application/zip",
}

_storage_key: Optional[str] = None


def init_storage() -> Optional[str]:
    """Initialize once at startup. Safe to call again — returns cached key."""
    global _storage_key
    if _storage_key:
        return _storage_key
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        return None
    try:
        r = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": key}, timeout=30)
        r.raise_for_status()
        _storage_key = r.json()["storage_key"]
        log.info("Object storage initialised.")
        return _storage_key
    except Exception as e:  # pragma: no cover
        log.warning("Object storage init failed: %s", e)
        return None


def _put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Storage unavailable")
    r = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=180,
    )
    r.raise_for_status()
    return r.json()


def _get_object(path: str) -> tuple[bytes, str]:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Storage unavailable")
    r = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=120,
    )
    r.raise_for_status()
    return r.content, r.headers.get("Content-Type", "application/octet-stream")


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

VIEW_CATEGORIES = ["demo", "artwork", "document", "video", "archive", "reference"]


@router.post("")
async def upload(
    request: Request,
    file: UploadFile = File(...),
    category: str = Form("demo"),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    visibility: str = Form("private"),  # private | shared | public
    user: UserPublic = Depends(current_user),
):
    db = request.app.state.db
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED:
        raise HTTPException(status_code=415, detail=f"Unsupported file type: .{ext}")
    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 50MB limit")
    content_type = ALLOWED[ext]
    file_id = uuid.uuid4().hex
    path = f"{APP_NAME}/portfolio/{user.user_id}/{file_id}.{ext}"
    result = _put_object(path, data, content_type)
    doc = {
        "id": file_id,
        "user_id": user.user_id,
        "user_name": user.name,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "extension": ext,
        "size": result.get("size", len(data)),
        "category": category,
        "title": title or file.filename,
        "description": description,
        "visibility": visibility if visibility in ("private", "shared", "public") else "private",
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.portfolio_files.insert_one(doc.copy())
    doc.pop("_id", None)
    return doc


@router.get("/mine")
async def my_files(request: Request, user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    cursor = db.portfolio_files.find(
        {"user_id": user.user_id, "is_deleted": False}, {"_id": 0},
    ).sort("created_at", -1)
    return await cursor.to_list(200)


@router.get("/user/{user_id}")
async def user_files(user_id: str, request: Request,
                     user: UserPublic = Depends(current_user)):
    """Files another user has marked public or shared with cohort."""
    db = request.app.state.db
    cursor = db.portfolio_files.find(
        {"user_id": user_id, "is_deleted": False, "visibility": {"$in": ["public", "shared"]}},
        {"_id": 0},
    ).sort("created_at", -1)
    return await cursor.to_list(200)


@router.get("/file/{file_id}/download")
async def download(file_id: str, request: Request,
                   auth: Optional[str] = Query(None)):
    """Signed download endpoint. Uses cookie/bearer auth OR ?auth= query token for <audio>/<img> tags."""
    db = request.app.state.db
    doc = await db.portfolio_files.find_one({"id": file_id, "is_deleted": False}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")
    # Public files skip auth
    if doc.get("visibility") != "public":
        # need to be authenticated
        token = request.cookies.get("coheir_session") or auth
        if not token:
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        sess = await db.user_sessions.find_one({"session_token": token})
        if not sess:
            raise HTTPException(status_code=401, detail="Session expired")
    data, ct = _get_object(doc["storage_path"])
    return Response(content=data, media_type=doc.get("content_type", ct))


class UpdateFileBody(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    visibility: Optional[str] = None


@router.patch("/file/{file_id}")
async def update_file(file_id: str, body: UpdateFileBody, request: Request,
                      user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    doc = await db.portfolio_files.find_one({"id": file_id, "user_id": user.user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if updates:
        await db.portfolio_files.update_one({"id": file_id}, {"$set": updates})
    updated = await db.portfolio_files.find_one({"id": file_id}, {"_id": 0})
    return updated


@router.delete("/file/{file_id}")
async def delete_file(file_id: str, request: Request,
                      user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    r = await db.portfolio_files.update_one(
        {"id": file_id, "user_id": user.user_id},
        {"$set": {"is_deleted": True}},
    )
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="File not found")
    return {"ok": True}
