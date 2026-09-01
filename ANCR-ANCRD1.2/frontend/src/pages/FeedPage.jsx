import React, { useEffect, useState } from "react";
import AppShell from "@/components/ancrd/AppShell";
import PageHeader from "@/components/ancrd/PageHeader";
import { api, timeAgo } from "@/lib/api";
import { Heart, MessageCircle, Share2, Bookmark, PartyPopper, Sparkles, Send, Image as ImageIcon, Music2, Video, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const REACTIONS = [
  { key: "like", label: "Like", icon: Heart },
  { key: "applaud", label: "Applaud", icon: PartyPopper },
  { key: "celebrate", label: "Celebrate", icon: Award },
  { key: "insightful", label: "Insightful", icon: Sparkles },
];

const KIND_ICON = { text: null, image: ImageIcon, music: Music2, video: Video, achievement: Award, event: Award };

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [suggested, setSuggested] = useState([]);

  const load = async () => {
    const { data } = await api.get("/posts");
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    api.get("/users").then(({ data }) => setSuggested(data.slice(0, 5)));
  }, []);

  const react = async (postId, key) => {
    await api.post(`/posts/${postId}/react`, { reaction: key });
    load();
  };

  const create = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    await api.post("/posts", { content, kind: "text" });
    setContent("");
    toast.success("Posted");
    load();
  };

  return (
    <AppShell>
      <PageHeader
        section="The Signal"
        kicker="Verified activity across the CCDP global network"
        description="Live posts, releases, collaboration calls, and achievements from every corner of the ANCRD Network."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <form onSubmit={create} className="glass rounded-sm p-4" data-testid="composer">
            <textarea
              data-testid="composer-input"
              value={content}
              onChange={(e)=>setContent(e.target.value)}
              placeholder="Share an update, a release, a collaboration call…"
              rows={3}
              className="w-full bg-transparent outline-none resize-none text-sm placeholder:text-white/30"
            />
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex gap-3 text-white/40">
                <ImageIcon className="h-4 w-4" />
                <Music2 className="h-4 w-4" />
                <Video className="h-4 w-4" />
              </div>
              <button data-testid="composer-submit" type="submit" className="px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest rounded-sm btn-cine text-white" style={{ background: "linear-gradient(90deg, #4F46E5, #A855F7, #EC4899, #F97316)" }}>
                Post
              </button>
            </div>
          </form>

          {loading && <div className="font-mono text-xs text-white/40">Loading…</div>}

          <div className="stagger space-y-4">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} onReact={react} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="glass rounded-sm p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Suggested Creators</div>
            <div className="mt-3 space-y-3">
              {suggested.map((u) => (
                <Link to={`/profile/${u.id}`} key={u.id} className="flex items-center gap-3 hover:bg-white/[0.03] p-1 -m-1 rounded-sm" data-testid={`suggested-${u.id}`}>
                  <img src={u.avatar} className="h-10 w-10 rounded-sm object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-sm truncate">{u.name}</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 truncate">{u.role} · {u.city}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="glass rounded-sm p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Trending Hashtags</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["#CCDP2026", "#WritingCamp", "#ANCRLAB", "#NewMusic", "#SyncLicensing", "#Portfolio"].map((h) => (
                <span key={h} className="px-2 py-1 border border-white/10 rounded-sm font-mono text-[10px] uppercase tracking-wider text-white/70">{h}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function PostCard({ post, onReact }) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const Icon = KIND_ICON[post.kind];

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await api.post(`/posts/${post.id}/comment`, { content: comment });
    setComment("");
    toast.success("Comment added");
  };

  return (
    <article data-testid={`post-${post.id}`} className="glass rounded-sm overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <Link to={`/profile/${post.author?.id}`}>
          <img src={post.author?.avatar} className="h-10 w-10 rounded-sm object-cover" alt="" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link to={`/profile/${post.author?.id}`} className="font-display font-bold text-sm hover:underline">
              {post.author?.name}
            </Link>
            {post.author?.verified && <span className="text-[9px] font-mono uppercase tracking-widest text-[#00E5FF]">Verified</span>}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">
            {post.author?.role} · {post.author?.institution} · {timeAgo(post.created_at)}
          </div>
        </div>
        {Icon && <Icon className="h-4 w-4 text-white/40" />}
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
              data-testid={`react-${r.key}-${post.id}`}
              onClick={() => onReact(post.id, r.key)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-white/60 hover:text-[#00E5FF] btn-cine rounded-sm"
            >
              <I className="h-3.5 w-3.5" />
              <span className="font-mono text-[10px]">{count}</span>
            </button>
          );
        })}
        <button data-testid={`comment-toggle-${post.id}`} onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 px-2 py-1 text-xs text-white/60 hover:text-white btn-cine rounded-sm">
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="font-mono text-[10px]">{post.comments?.length || 0}</span>
        </button>
        <div className="flex-1" />
        <button className="p-1.5 text-white/50 hover:text-white btn-cine"><Bookmark className="h-3.5 w-3.5" /></button>
        <button className="p-1.5 text-white/50 hover:text-white btn-cine"><Share2 className="h-3.5 w-3.5" /></button>
      </div>
      {showComments && (
        <div className="border-t border-white/5 p-3 bg-black/30">
          <div className="space-y-2 mb-3">
            {post.comments?.map((c) => (
              <div key={c.id} className="flex gap-2 items-start">
                <img src={c.avatar} className="h-7 w-7 rounded-sm object-cover" alt="" />
                <div className="flex-1 bg-white/[0.03] rounded-sm px-3 py-2">
                  <div className="text-xs"><span className="font-display font-bold">{c.author_name}</span> <span className="text-white/40 font-mono text-[10px] ml-1">{timeAgo(c.created_at)}</span></div>
                  <div className="text-sm text-white/85 mt-0.5">{c.content}</div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={submitComment} className="flex gap-2">
            <input
              data-testid={`comment-input-${post.id}`}
              value={comment}
              onChange={(e)=>setComment(e.target.value)}
              placeholder="Write a comment…"
              className="flex-1 bg-black/40 border border-white/10 focus:border-white/30 outline-none rounded-sm px-3 py-1.5 text-sm"
            />
            <button data-testid={`comment-submit-${post.id}`} type="submit" className="px-3 border border-white/15 hover:border-white/30 btn-cine rounded-sm"><Send className="h-3.5 w-3.5" /></button>
          </form>
        </div>
      )}
    </article>
  );
}
