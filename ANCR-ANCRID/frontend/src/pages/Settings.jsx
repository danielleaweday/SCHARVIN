import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiErrorDetail } from "@/lib/api";
import { SectionTitle } from "@/components/GlassCard";
import { toast } from "sonner";
import { Loader2, Upload as UploadIcon, Copy, Check, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

export default function Settings() {
  const { user, refreshMe } = useAuth();
  const i = user?.identity || {};
  const [form, setForm] = useState({
    biography: i.biography || "",
    mission: i.mission || "",
    location: i.location || "",
    website: i.website || "",
    pronouns: i.pronouns || "",
    headshot_url: i.headshot_url || "",
    banner_url: i.banner_url || "",
  });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  function up(k) { return (e) => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/ancrid/identity", form);
      await refreshMe();
      toast.success("Identity updated");
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function copyShare() {
    const url = `${window.location.origin}/@${user?.handle}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Public creator link copied");
  }

  const shareUrl = `${window.location.origin}/@${user?.handle}`;

  return (
    <div className="space-y-8" data-testid="settings-page">
      <SectionTitle eyebrow="Settings" title="Curate your public identity." testid="settings-title" />

      {/* Public link card */}
      <div className="glass rounded-3xl p-6 flex items-center justify-between gap-4 flex-wrap" data-testid="settings-public-link">
        <div>
          <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40">Public Creator Page</div>
          <div className="font-display text-xl tracking-tight text-white mt-1">Share your ANCRID</div>
          <div className="font-mono text-sm text-white/70 mt-2 break-all">{shareUrl}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyShare} className="inline-flex items-center gap-2 text-xs bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white rounded-full px-4 py-2 transition-colors" data-testid="settings-copy-link">
            {copied ? <Check size={13} className="text-[#00e5ff]" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy link"}
          </button>
          <Link to={`/@${user?.handle}`} target="_blank" className="inline-flex items-center gap-2 text-xs bg-white text-black rounded-full px-4 py-2 hover:bg-white/90" data-testid="settings-open-link">
            <ExternalLink size={13} /> Open
          </Link>
        </div>
      </div>

      <form onSubmit={onSave} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-3xl p-7 space-y-5">
          <Field label="Biography">
            <textarea rows={4} value={form.biography} onChange={up("biography")} data-testid="settings-bio" className="ancr-ta" />
          </Field>
          <Field label="Mission Statement">
            <textarea rows={2} value={form.mission} onChange={up("mission")} data-testid="settings-mission" className="ancr-ta" />
          </Field>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Location">
              <input value={form.location} onChange={up("location")} data-testid="settings-location" className="ancr-input" />
            </Field>
            <Field label="Pronouns">
              <input value={form.pronouns} onChange={up("pronouns")} data-testid="settings-pronouns" className="ancr-input" />
            </Field>
          </div>
          <Field label="Personal Website">
            <input value={form.website} onChange={up("website")} data-testid="settings-website" className="ancr-input" placeholder="https://" />
          </Field>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-3xl p-7 space-y-4">
            <UploadField
              label="Headshot"
              testid="settings-headshot-upload"
              value={form.headshot_url}
              onChange={(url) => setForm(f => ({ ...f, headshot_url: url }))}
              aspect="square"
            />
            <UploadField
              label="Banner"
              testid="settings-banner-upload"
              value={form.banner_url}
              onChange={(url) => setForm(f => ({ ...f, banner_url: url }))}
              aspect="banner"
            />
          </div>
          <button
            type="submit"
            data-testid="settings-save"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-white/90 disabled:opacity-60 text-black font-medium rounded-2xl px-5 py-4 transition-colors"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving ? "Saving…" : "Save Identity"}
          </button>
        </div>
      </form>

      <style>{`
        .ancr-input, .ancr-ta {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 1rem;
          padding: 0.85rem 1rem;
          color: #fff;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .ancr-input:focus, .ancr-ta:focus { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.05); }
        .ancr-ta { resize: vertical; min-height: 90px; }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40 mb-2">{label}</div>
      {children}
    </label>
  );
}

function UploadField({ label, value, onChange, aspect, testid }) {
  const ref = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function pick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/files/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = `${BACKEND}${data.url}`;
      onChange(url);
      toast.success(`${label} uploaded`);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Upload failed");
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div data-testid={testid}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40">{label}</div>
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-white/70 hover:text-white bg-white/[0.05] border border-white/10 rounded-full px-2.5 py-1"
        >
          {uploading ? <Loader2 size={11} className="animate-spin" /> : <UploadIcon size={11} />} Upload
        </button>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={pick} data-testid={`${testid}-input`} />
      </div>
      {value ? (
        <img
          src={value} alt=""
          className={`w-full ${aspect === "square" ? "h-40" : "h-24"} object-cover rounded-2xl border border-white/10`}
        />
      ) : (
        <div className={`w-full ${aspect === "square" ? "h-40" : "h-24"} rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-white/30 font-mono text-[10px] tracking-[0.2em] uppercase`}>
          No image yet
        </div>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="or paste an image URL"
        className="ancr-input mt-2 text-xs"
        data-testid={`${testid}-url`}
      />
    </div>
  );
}
