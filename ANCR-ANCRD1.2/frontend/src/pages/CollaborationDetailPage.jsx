import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AppShell from "@/components/ancrd/AppShell";
import PageHeader from "@/components/ancrd/PageHeader";
import { api, timeAgo } from "@/lib/api";
import {
  Heart, MessageCircle, Share2, Bookmark, PartyPopper, Sparkles, Send,
  Users2, Pin, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

const REACTIONS = [
  { key: "like", label: "Like", icon: Heart },
  { key: "applaud", label: "Applaud", icon: PartyPopper },
  { key: "celebrate", label: "Celebrate", icon: Sparkles },
  { key: "insightful", label: "Insightful", icon: Sparkles },
];

export default function CollaborationDetailPage() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  const loadCommunity = () => api.get(`/communities/${id}`).then(({ data }) => setC(data));
  const loadPosts = () => api.get(`/communities/${id}/posts`).then(({ data }) => setPosts(data));

  useEffect(() => {
    loadCommunity();
    loadPosts();
  }, [id]);

  const post = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    try {
      await api.post("/posts", { content, kind: "text", community_id: id });
      setContent("");
      toast.success("Posted to " + c.name);
      loadPosts();
    } finally {
      setBusy(false);
    }
  };

  const react = async (postId, key) => {
    await api.post(`/posts/${postId}/react`, { reaction: key });
    loadPosts();
  };

  const toggleMembership = async () => {
    if (!c) return;
    if (c.is_member) {
      await api.post(`/communities/${id}/leave`);
      toast.success("Left " + c.name);
    } else {
      await api.post(`/communities/${id}/join`);
      toast.success("Joined " + c.name);
    }
    loadCommunity();
  };

  if (!c) return <AppShell><div className="font-mono text-xs text-white/40">Loading collaboration…</div></AppShell>;

  return (
    <AppShell>
      <div className="mb-4">
        <Link to="/collaborations" className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white btn-cine" data-testid="back-to-collabs">
          <ArrowLeft className="h-3 w-3" /> All Collaborations
        </Link>
      </div>

      <PageHeader
        section="Collaborations"
        kicker={c.category}
        description={c.description}
        right={
          <button
            data-testid="collab-toggle-membership"
            onClick={toggleMembership}
            className={`px-4 py-2 font-mono text-[11px] uppercase tracking-widest rounded-sm btn-cine ${
              c.is_member
                ? "border border-white/20 text-white/80 hover:border-white/40"
                : "text-white"
            }`}
            style={
              !c.is_member
                ? { background: "linear-gradient(90deg, #4F46E5, #A855F7, #EC4899, #F97316)" }
                : {}
            }
          >
            {c.is_member ? "Joined ✓" : "Join Collaboration"}
          </button>
        }
      />

      <div className="relative rounded-sm overflow-hidden border border-white/10 mb-8" data-testid="collab-banner">
        <img src={c.banner} className="w-full h-56 object-cover opacity-60" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#F97316" }}>{c.category}</div>
          <div className="font-display font-black text-4xl md:text-5xl tracking-tighter mt-1">{c.name}</div>
          <div className="mt-2 flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-white/60">
            <span className="flex items-center gap-1"><Users2 className="h-3 w-3" /> {c.member_profiles?.length || 0} members</span>
            <span className="flex items-center gap-1"><Pin className="h-3 w-3" /> Verified only</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {c.is_member ? (
            <form onSubmit={post} className="glass rounded-sm p-4" data-testid="collab-composer">
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">
                Post to {c.name}
              </div>
              <textarea
                data-testid="collab-composer-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Share with ${c.name}…`}
                rows={3}
                className="w-full bg-transparent outline-none resize-none text-sm placeholder:text-white/30"
              />
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  Only members of {c.name} will see this
                </div>
                <button
                  data-testid="collab-composer-submit"
                  type="submit"
                  disabled={busy}
                  className="px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest rounded-sm btn-cine text-white disabled:opacity-40"
                  style={{ background: "linear-gradient(90deg, #4F46E5, #A855F7, #EC4899, #F97316)" }}
                >
                  {busy ? "Posting…" : "Post"}
                </button>
              </div>
            </form>
          ) : (
            <div className="glass rounded-sm p-6 text-center">
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Members only</div>
              <div className="font-display font-black text-xl tracking-tighter mb-2">
                Join {c.name} to post and see the full feed
              </div>
              <button
                onClick={toggleMembership}
                className="mt-2 px-4 py-2 font-mono text-[11px] uppercase tracking-widest rounded-sm btn-cine text-white"
                style={{ background: "linear-gradient(90deg, #4F46E5, #A855F7, #EC4899, #F97316)" }}
              >
                Join Collaboration
              </button>
            </div>
          )}

          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 pt-2">
            {posts.length} {posts.length === 1 ? "post" : "posts"} in this collaboration
          </div>

          <div className="stagger space-y-4">
            {posts.length === 0 && (
              <div className="glass rounded-sm p-8 text-center">
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Quiet in here</div>
                <div className="text-white/60 text-sm">Be the first to post to {c.name}.</div>
              </div>
            )}
            {posts.map((p) => (
              <CollabPostCard key={p.id} post={p} onReact={react} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="glass rounded-sm p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">About</div>
            <div className="mt-2 text-sm text-white/80">{c.description}</div>
            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="font-display font-black text-2xl tracking-tighter">{c.member_profiles?.length || 0}</div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">Members</div>
              </div>
              <div>
                <div className="font-display font-black text-2xl tracking-tighter">{posts.length}</div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">Posts</div>
              </div>
            </div>
          </div>

          <div className="glass rounded-sm p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Members</div>
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {c.member_profiles?.slice(0, 20).map((u) => (
                <Link
                  key={u.id}
                  to={`/profile/${u.id}`}
                  data-testid={`collab-member-${u.id}`}
                  className="flex items-center gap-3 p-1.5 -mx-1.5 rounded-sm hover:bg-white/[0.03] btn-cine"
                >
                  <img src={u.avatar} className="h-8 w-8 rounded-sm object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-sm truncate">{u.name}</div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-white/40 truncate">{u.role} · {u.city}</div>
                  </div>
                </Link>
              ))}
              {c.member_profiles?.length > 20 && (
                <div className="pt-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
                  + {c.member_profiles.length - 20} more
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function CollabPostCard({ post, onReact }) {
  return (
    <article data-testid={`collab-post-${post.id}`} className="glass rounded-sm overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <Link to={`/profile/${post.author?.id}`}>
          <img src={post.author?.avatar} className="h-10 w-10 rounded-sm object-cover" alt="" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/profile/${post.author?.id}`} className="font-display font-bold text-sm hover:underline">
            {post.author?.name}
          </Link>
          <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">
            {post.author?.role} · {timeAgo(post.created_at)}
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <p className="text-[15px] leading-relaxed text-white/90 whitespace-pre-wrap">{post.content}</p>
        {post.hashtags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.hashtags.map((h) => (
              <span key={h} className="font-mono text-[10px]" style={{ color: "#F97316" }}>{h}</span>
            ))}
          </div>
        )}
      </div>
      {post.media_url && (
        <div className="border-y border-white/5">
          <img src={post.media_url} className="w-full max-h-[520px] object-cover" alt="" />
        </div>
      )}
      <div className="px-3 py-2 flex items-center gap-1 flex-wrap">
        {REACTIONS.map((r) => {
          const count = post.reactions?.[r.key]?.length || 0;
          const I = r.icon;
          return (
            <button
              key={r.key}
              data-testid={`collab-react-${r.key}-${post.id}`}
              onClick={() => onReact(post.id, r.key)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-white/60 hover:text-[#F97316] btn-cine rounded-sm"
            >
              <I className="h-3.5 w-3.5" />
              <span className="font-mono text-[10px]">{count}</span>
            </button>
          );
        })}
        <button className="flex items-center gap-1 px-2 py-1 text-xs text-white/60 hover:text-white btn-cine rounded-sm">
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="font-mono text-[10px]">{post.comments?.length || 0}</span>
        </button>
        <div className="flex-1" />
        <button className="p-1.5 text-white/50 hover:text-white btn-cine"><Bookmark className="h-3.5 w-3.5" /></button>
        <button className="p-1.5 text-white/50 hover:text-white btn-cine"><Share2 className="h-3.5 w-3.5" /></button>
      </div>
    </article>
  );
}
