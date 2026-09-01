"""Focused verification for GET /api/media?q= regex-escape fix (iteration_6)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break


def _login(email, pw):
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": pw})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return {"Authorization": f"Bearer {r.json()['token']}"}


@pytest.fixture(scope="module")
def admin_h():
    return _login("admin@viearta.demo", "admin123")


@pytest.fixture(scope="module")
def created_media(admin_h):
    payload = {
        "title": "RegexTest Sample",
        "url": "https://youtube.com/watch?v=regexTst",
        "media_type": "video",
        "category": "general",
        "description": "A media item for regex-escape verification",
    }
    r = requests.post(f"{BASE_URL}/api/media", json=payload, headers=admin_h)
    assert r.status_code == 200, f"create media failed: {r.status_code} {r.text}"
    mid = r.json()["id"]
    yield mid
    requests.delete(f"{BASE_URL}/api/media/{mid}", headers=admin_h)


def _search(headers, q):
    r = requests.get(f"{BASE_URL}/api/media", params={"q": q}, headers=headers)
    assert r.status_code == 200, f"list media failed: {r.status_code} {r.text}"
    body = r.json()
    return body["items"] if isinstance(body, dict) and "items" in body else body


def test_regex_wildcard_does_not_match_all(admin_h, created_media):
    """'.*' must be treated as literal string, not a wildcard regex."""
    items = _search(admin_h, ".*")
    titles = [i.get("title", "") for i in items]
    assert "RegexTest Sample" not in titles, (
        f"'.*' matched RegexTest Sample as wildcard. Titles: {titles[:10]}"
    )


def test_regex_paren_metacharacter_literal(admin_h, created_media):
    """Unbalanced '(' must not raise and must not wildcard-match."""
    items = _search(admin_h, "(")
    titles = [i.get("title", "") for i in items]
    assert "RegexTest Sample" not in titles


def test_ordinary_search_still_works(admin_h, created_media):
    items = _search(admin_h, "RegexTest")
    titles = [i.get("title", "") for i in items]
    assert "RegexTest Sample" in titles, f"Expected RegexTest Sample, got: {titles}"


def test_ordinary_search_case_insensitive(admin_h, created_media):
    items = _search(admin_h, "regextest")
    titles = [i.get("title", "") for i in items]
    assert "RegexTest Sample" in titles, f"case-insensitive failed, got: {titles}"
