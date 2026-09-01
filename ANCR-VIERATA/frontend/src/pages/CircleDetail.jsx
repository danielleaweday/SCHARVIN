import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Calendar, MapPin, Users, Send, Trash2, MessageCircle, UserCheck, Loader2, Lock, Video, ExternalLink, Save } from "lucide-react";
import { MediaPlayer, MediaPlaceholder } from "@/components/media/MediaPlayer";

function fmtWhen(iso) {
  return new Date(iso).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function CircleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ci, setCi] = useState(null);
  const [media, setMedia] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msgBody, setMsgBody] = useState("");
  const [msgKind, setMsgKind] = useState("pre");
  const [sending, setSending] = useState(false);
  const [busyRsvp, setBusyRsvp] = useState(false);
  const [membershipBlocked, setMembershipBlocked] = useState(false);
  const [joinUrlEdit, setJoinUrlEdit] = useState("");
  const [savingJoinUrl, setSavingJoinUrl] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get(`/circles/${id}`);
      setCi(data);
      setJoinUrlEdit(data.join_url || "");
    } catch { toast.error("Couldn't load circle"); return; }
    try {
      const { data: mres } = await api.get(`/media/for-circle/${id}`);
      setMedia(mres.items);
    } catch {}
    try {
      const { data: chats } = await api.get(`/circles/${id}/messages`);
      setMessages(chats.items);
      setMembershipBlocked(false);
    } catch (e) {
      if (e?.response?.status === 403) setMembershipBlocked(true);
      else setMessages([]);
    }
  };
  useEffect(() => { load(); }, [id]);

  const toggleRsvp = async () => {
    setBusyRsvp(true);
    try {
      const { data } = await api.post("/circles/rsvp", { circle_id: id });
      toast.success(data.rsvp ? "RSVP confirmed" : "RSVP removed");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Couldn't update RSVP");
    } finally { setBusyRsvp(false); }
  };

  const post = async () => {
    if (!msgBody.trim()) return;
    setSending(true);
    try {
      await api.post(`/circles/${id}/messages`, { body: msgBody, kind: msgKind });
      setMsgBody("");
      load();
    } catch { toast.error("Couldn't post message"); } finally { setSending(false); }
  };

  const remove = async (mid) => {
    if (!window.confirm("Remove this message?")) return;
    try { await api.delete(`/circles/messages/${mid}`); load(); toast.success("Removed"); }
    catch { toast.error("Couldn't remove"); }
  };

  const saveJoinUrl = async () => {
    setSavingJoinUrl(true);
    try {
      await api.put(`/circles/${id}/join-url`, { join_url: joinUrlEdit.trim() || null });
      toast.success("Circle join link updated");
      load();
    } catch { toast.error("Couldn't update join link"); } finally { setSavingJoinUrl(false); }
  };

  if (!ci) return <div className="text-white/50 text-sm">Loading…</div>;

  const preMsgs = messages.filter((m) => m.kind === "pre");
  const postMsgs = messages.filter((m) => m.kind === "post");
  const genMsgs = messages.filter((m) => m.kind === "general");

  const MessageList = ({ items, label, empty }) => (
    <div className="mt-4">
      <div className="text-[11px] uppercase tracking-[0.22em] text-viearta-teal mb-2">{label} · {items.length}</div>
      {items.length === 0 ? (
        <div className="text-xs text-white/40 italic py-2">{empty}</div>
      ) : (
        <ul className="space-y-2">
          {items.map((m) => (
            <li key={m.id} data-testid={`msg-${m.id}`} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center justify-between text-[11px] text-white/45">
                <span>{m.first_name} · {m.discipline}</span>
                <div className="flex items-center gap-2">
                  <span>{new Date(m.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                  {(m.user_id === user?.id || user?.role === "admin") && (
                    <button onClick={() => remove(m.id)} className="text-white/40 hover:text-white/80" title="Remove"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </div>
              <div className="text-sm text-white/85 mt-1 whitespace-pre-line">{m.body}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="fade-up" data-testid="circle-detail">
      <button onClick={() => navigate("/circle")} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Wellness Circle
      </button>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: "#D97706" }} />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.22em] text-viearta-teal">{ci.focus}</div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight mt-1">{ci.title}</h1>
          <p className="text-white/65 mt-2 max-w-2xl">{ci.description}</p>
          <div className="mt-3 text-sm text-white/60 flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" /> {fmtWhen(ci.starts_at)}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {ci.location}</span>
            <span className="inline-flex items-center gap-1"><Users className="w-4 h-4" /> {ci.rsvp_count} / {ci.capacity}</span>
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {ci.my_rsvp && <span className="inline-flex items-center gap-1 text-xs text-viearta-teal border border-viearta-teal/30 bg-viearta-teal/10 rounded-full px-2 py-0.5"><UserCheck className="w-3 h-3" /> You're in</span>}
            {ci.join_url && ci.my_rsvp && (
              <a href={ci.join_url} target="_blank" rel="noopener noreferrer" data-testid="circle-join-btn"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm bg-viearta-teal/20 border border-viearta-teal/40 text-viearta-teal hover:bg-viearta-teal/30">
                <Video className="w-4 h-4" /> Join circle <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button onClick={toggleRsvp} disabled={busyRsvp || (!ci.my_rsvp && ci.spots_left === 0)}
              data-testid="detail-rsvp-btn"
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${ci.my_rsvp ? "bg-white/10 border border-white/20 hover:bg-white/15" : "bg-white text-black hover:bg-white/90"} disabled:opacity-60`}>
              {busyRsvp && <Loader2 className="w-4 h-4 animate-spin" />}
              {ci.my_rsvp ? "Cancel RSVP" : ci.spots_left === 0 ? "Full" : "RSVP"}
            </button>
          </div>

          {user?.role === "admin" && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-3 flex items-center gap-2 flex-wrap" data-testid="admin-join-url">
              <span className="text-[10px] uppercase tracking-[0.22em] text-white/45">ANCRSYNC join URL</span>
              <input value={joinUrlEdit} onChange={(e) => setJoinUrlEdit(e.target.value)}
                placeholder="https://ancrsync.example.com/room/…"
                data-testid="admin-join-url-input"
                className="flex-1 min-w-[240px] bg-white/[0.03] border border-white/10 rounded-full px-4 py-1.5 text-sm outline-none placeholder:text-white/30" />
              <button onClick={saveJoinUrl} disabled={savingJoinUrl} data-testid="admin-join-url-save"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs bg-white text-black hover:bg-white/90 disabled:opacity-60">
                {savingJoinUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
              </button>
            </div>
          )}

          {ci.by_discipline && Object.keys(ci.by_discipline).length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/45 mb-1">Who's joining</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(ci.by_discipline).map(([d, n]) => (
                  <span key={d} className="text-[11px] px-2 py-1 rounded-full border border-white/10 text-white/70">{d} · {n}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
        <h2 className="font-display text-2xl mb-3">Health workshop videos</h2>
        {media.length === 0 ? (
          <MediaPlaceholder />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {media.map((m) => <MediaPlayer key={m.id} item={m} />)}
          </div>
        )}
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8">
        <h2 className="font-display text-2xl mb-1 inline-flex items-center gap-2"><MessageCircle className="w-5 h-5 text-viearta-teal" /> Circle chat</h2>
        <p className="text-white/60 text-sm">Pre-gathering and post-gathering threads for members of this circle.</p>

        {membershipBlocked ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
            <Lock className="w-5 h-5 text-white/50 mx-auto mb-2" />
            <div className="text-sm text-white/80">RSVP to join the conversation</div>
            <div className="text-xs text-white/50 mt-1">The chat is only visible to circle members.</div>
          </div>
        ) : (
          <>
            {ci.my_rsvp && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex gap-2 mb-2">
                  {[
                    ["pre", "Pre-gathering"],
                    ["general", "General"],
                    ["post", "Post-gathering"],
                  ].map(([k, l]) => (
                    <button key={k} onClick={() => setMsgKind(k)} data-testid={`chat-kind-${k}`}
                      className={`px-3 py-1.5 rounded-full text-xs border ${msgKind === k ? "bg-white/10 border-white/40" : "border-white/10 text-white/55 hover:text-white/85"}`}>{l}</button>
                  ))}
                </div>
                <textarea value={msgBody} onChange={(e) => setMsgBody(e.target.value)}
                  placeholder="Share something with the circle…" rows={3}
                  data-testid="chat-body"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-3 text-sm outline-none resize-none placeholder:text-white/30" />
                <div className="mt-3 flex justify-end">
                  <button onClick={post} disabled={sending || !msgBody.trim()} data-testid="chat-send"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm bg-white text-black hover:bg-white/90 disabled:opacity-60">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Post
                  </button>
                </div>
              </div>
            )}

            <MessageList items={preMsgs} label="Pre-gathering" empty="Nothing yet — kick off the pre-gathering thread." />
            <MessageList items={genMsgs} label="General" empty="No general messages yet." />
            <MessageList items={postMsgs} label="Post-gathering" empty="Post-gathering reflections will appear here after the circle." />
          </>
        )}
      </section>
    </div>
  );
}
