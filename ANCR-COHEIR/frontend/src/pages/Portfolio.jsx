import React, { useEffect, useRef, useState } from "react";
import { api, API_BASE } from "@/lib/api";
import { toast } from "sonner";
import { RoleChip } from "@/components/coheir/MentorCard";
import { Upload, FileAudio, FileVideo, FileText, Image as ImageIcon, Archive, Trash2, Globe, Lock, Users } from "lucide-react";
import { motion } from "framer-motion";

const ICONS = {
  mp3: FileAudio, wav: FileAudio, aiff: FileAudio, aif: FileAudio, flac: FileAudio,
  mp4: FileVideo, mov: FileVideo,
  pdf: FileText, docx: FileText, pptx: FileText, xlsx: FileText,
  jpg: ImageIcon, jpeg: ImageIcon, png: ImageIcon, webp: ImageIcon, gif: ImageIcon, heic: ImageIcon,
  zip: Archive,
};

const CATEGORIES = [
  { v: "demo", l: "Demo Track" }, { v: "artwork", l: "Artwork" },
  { v: "document", l: "Document" }, { v: "video", l: "Video" },
  { v: "reference", l: "Reference" }, { v: "archive", l: "Archive" },
];

function humanSize(bytes) {
  if (!bytes) return "0 B";
  const k = 1024, sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export default function Portfolio() {
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState("demo");
  const [visibility, setVisibility] = useState("private");
  const [busy, setBusy] = useState(false);
  const dropRef = useRef(null);
  const inputRef = useRef(null);

  const load = () => api.get("/uploads/mine").then(({ data }) => setFiles(data));
  useEffect(() => { load(); }, []);

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", category);
      fd.append("visibility", visibility);
      await api.post("/uploads", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`Uploaded ${file.name}`);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Upload failed");
    } finally { setBusy(false); }
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const setVis = async (id, v) => {
    await api.patch(`/uploads/file/${id}`, { visibility: v });
    toast.success(`Set to ${v}`);
    load();
  };
  const remove = async (id) => {
    await api.delete(`/uploads/file/${id}`);
    toast.success("Removed");
    load();
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Portfolio</div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">Your lifelong creative library.</h1>
        <p className="text-zinc-500 mt-2 max-w-2xl text-sm">
          Upload demos, artwork, PDFs, video, and archives. Files persist across CCDP and into your professional career via ANCRID™.
        </p>
      </header>

      <motion.div
        ref={dropRef}
        onDragOver={(e) => { e.preventDefault(); dropRef.current?.classList.add("border-[#00F0FF]"); }}
        onDragLeave={() => dropRef.current?.classList.remove("border-[#00F0FF]")}
        onDrop={onDrop}
        className="glass-panel border-2 border-dashed border-white/10 p-10 text-center transition-colors">
        <Upload className="w-8 h-8 mx-auto text-[#00F0FF] mb-4" />
        <div className="wordmark text-xl text-white">Drop files here or browse</div>
        <div className="text-zinc-500 text-xs mt-1">MP3, WAV, AIFF, FLAC, MP4, MOV, PDF, DOCX, PPTX, XLSX, PNG, JPG, ZIP · up to 50 MB</div>
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((c) => (
            <button key={c.v} onClick={() => setCategory(c.v)} data-testid={`portfolio-cat-${c.v}`}
              className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest border ${
                category === c.v ? "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30" :
                "bg-white/[0.03] text-zinc-400 border-white/[0.08]"}`}>
              {c.l}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2 justify-center">
          {["private", "shared", "public"].map((v) => (
            <button key={v} onClick={() => setVisibility(v)} data-testid={`portfolio-vis-${v}`}
              className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest border ${
                visibility === v ? "bg-white/[0.08] text-white border-white/20" :
                "bg-white/[0.03] text-zinc-400 border-white/[0.08]"}`}>
              {v}
            </button>
          ))}
        </div>
        <button data-testid="portfolio-choose-file"
          onClick={() => inputRef.current?.click()} disabled={busy}
          className="btn-primary text-sm mt-6 inline-flex items-center gap-2">
          {busy ? "Uploading…" : "Choose file"}
        </button>
        <input ref={inputRef} type="file" className="hidden"
          data-testid="portfolio-file-input"
          onChange={(e) => handleFile(e.target.files?.[0])} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files.map((f) => {
          const Icon = ICONS[f.extension] || FileText;
          const isImage = ["jpg", "jpeg", "png", "webp", "gif", "heic"].includes(f.extension);
          const bearer = localStorage.getItem("coheir_bearer");
          const previewUrl = `${API_BASE}/uploads/file/${f.id}/download?auth=${bearer || ""}`;
          return (
            <div key={f.id} className="glass-interactive p-0 overflow-hidden" data-testid={`portfolio-file-${f.id}`}>
              <div className="h-32 bg-black/60 relative overflow-hidden">
                {isImage ? (
                  <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center">
                    <Icon className="w-12 h-12 text-zinc-500" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <RoleChip tone={f.visibility === "public" ? "orange" : f.visibility === "shared" ? "violet" : "zinc"}>
                    {f.visibility === "public" ? <Globe className="w-3 h-3 inline mr-1" /> :
                     f.visibility === "shared" ? <Users className="w-3 h-3 inline mr-1" /> :
                     <Lock className="w-3 h-3 inline mr-1" />}
                    {f.visibility}
                  </RoleChip>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div className="text-white text-sm font-semibold truncate" title={f.original_filename}>{f.title || f.original_filename}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 flex justify-between">
                  <span>{f.category}</span>
                  <span>{humanSize(f.size)}</span>
                </div>
                <div className="flex items-center gap-1">
                  {["private", "shared", "public"].map((v) => (
                    <button key={v} onClick={() => setVis(f.id, v)}
                      className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-widest ${
                        f.visibility === v ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-white"}`}>{v}</button>
                  ))}
                  <button onClick={() => remove(f.id)} className="ml-auto text-zinc-500 hover:text-red-400 p-1"
                    data-testid={`portfolio-delete-${f.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {files.length === 0 && (
          <div className="col-span-full glass-panel p-10 text-center text-zinc-500">
            Your resource library is empty. Upload your first creative asset above.
          </div>
        )}
      </div>
    </div>
  );
}
