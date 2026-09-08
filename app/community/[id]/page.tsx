"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Post = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string;
  college: string | null;
  branch: string | null;
  avatar_url?: string | null;
};

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export default function BlogPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, Profile>>({});
  const [commentText, setCommentText] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (postId) loadBlog();
  }, [postId]);

  async function loadBlog() {
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setCurrentUserId(user.id);

    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .maybeSingle();

    if (postError) {
      console.error("POST ERROR:", postError);
      setError("Could not load this blog.");
      setLoading(false);
      return;
    }

    if (!postData) {
      setPost(null);
      setLoading(false);
      return;
    }

    setPost(postData);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, college, branch, avatar_url")
      .eq("id", postData.user_id)
      .maybeSingle();
    setAuthor(profileData || null);

    const { data: likesData } = await supabase
      .from("post_likes")
      .select("user_id")
      .eq("post_id", postId);
    setLikeCount(likesData?.length || 0);
    setLikedByMe((likesData || []).some((like) => like.user_id === user.id));

    const { data: commentsData } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    const loadedComments = commentsData || [];
    setComments(loadedComments);

    const commentUserIds = [...new Set(loadedComments.map((comment) => comment.user_id))];
    if (commentUserIds.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, college, branch, avatar_url")
        .in("id", commentUserIds);
      const map: Record<string, Profile> = {};
      (profiles || []).forEach((profile) => {
        map[profile.id] = profile;
      });
      setCommentAuthors(map);
    }

    setLoading(false);
  }

  async function toggleLike() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    if (likedByMe) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
      if (error) return console.error(error);
      setLikedByMe(false);
      setLikeCount((count) => Math.max(0, count - 1));
    } else {
      const { error } = await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: user.id });
      if (error) return console.error(error);
      setLikedByMe(true);
      setLikeCount((count) => count + 1);
    }
  }

  async function addComment() {
    const text = commentText.trim();
    if (!text) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("post_comments")
      .insert({ post_id: postId, user_id: user.id, content: text })
      .select()
      .single();

    if (error || !data) {
      console.error("ADD COMMENT ERROR:", error);
      return;
    }

    setComments((current) => [...current, data]);
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, college, branch, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    if (profileData) {
      setCommentAuthors((current) => ({ ...current, [user.id]: profileData }));
    }
    setCommentText("");
  }

  async function deleteComment(commentId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id);
    if (error) return console.error("DELETE COMMENT ERROR:", error);

    setComments((current) => current.filter((comment) => comment.id !== commentId));
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="mt-4 font-bold text-slate-500">Loading blog…</p>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 text-slate-900">
        <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="text-4xl">📄</div>
          <h1 className="mt-5 text-3xl font-black">Blog not found</h1>
          <p className="mt-3 leading-7 text-slate-500">This blog may have been removed or is no longer available.</p>
          <button onClick={() => router.push("/community")} className="mt-7 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white hover:bg-blue-600">
            Back to Blogs
          </button>
        </div>
      </main>
    );
  }

  const isOwner = currentUserId === post.user_id;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-6">
          <button onClick={() => router.push("/")} className="text-xl font-black tracking-tight sm:text-2xl">
            TECHNERVA<span className="text-blue-600">.</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/community")} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              ← Blogs
            </button>
            <button onClick={() => router.push("/connections")} className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 sm:block">
              Connections
            </button>
          </div>
        </div>
      </nav>

      <div className="technerva-grid">
        <header className="mx-auto max-w-4xl px-5 pb-8 pt-10 sm:px-6 sm:pt-14">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
              {post.category || "Engineering"}
            </span>
            <span className="text-sm font-medium text-slate-400">
              {new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl md:text-6xl md:leading-[1.05]">
            {post.title}
          </h1>

          <button onClick={() => router.push(`/profile/${post.user_id}`)} className="mt-7 flex items-center gap-3 text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 font-black text-blue-700 ring-1 ring-slate-200">
              {author?.avatar_url ? (
                <img src={author.avatar_url} alt={author.full_name} className="h-full w-full object-cover" />
              ) : (
                author?.full_name?.charAt(0).toUpperCase() || "E"
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900">{author?.full_name || "Engineering Student"}</p>
              <p className="text-sm text-slate-500">
                {author?.college || "Engineering community"}{author?.branch ? ` • ${author.branch}` : ""}
              </p>
            </div>
          </button>

          {isOwner && (
            <button onClick={() => router.push(`/community/${post.id}/edit`)} className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-100">
              ✏️ Edit blog
            </button>
          )}
        </header>

        <section className="mx-auto max-w-4xl px-5 pb-16 sm:px-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 md:p-12">
            <div className="whitespace-pre-wrap text-[17px] leading-8 text-slate-700 sm:text-lg sm:leading-9">
              {post.content}
            </div>

            <div className="mt-10 flex items-center gap-3 border-t border-slate-100 pt-6">
              <button
                onClick={toggleLike}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${likedByMe ? "bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700"}`}
              >
                {likedByMe ? "♥" : "♡"} {likeCount} {likeCount === 1 ? "Like" : "Likes"}
              </button>
            </div>
          </article>

          {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</div>}

          <section className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold tracking-[0.18em] text-blue-600">DISCUSSION</p>
                <h2 className="mt-2 text-2xl font-black">Comments <span className="text-base font-bold text-slate-400">{comments.length}</span></h2>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addComment(); }}
                  placeholder="Share your thoughts…"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                />
                <button onClick={addComment} className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white hover:bg-blue-600">
                  Comment
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {comments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <p className="font-medium text-slate-500">No comments yet. Start the discussion.</p>
                </div>
              ) : (
                comments.map((comment) => {
                  const commentAuthor = commentAuthors[comment.user_id];
                  return (
                    <div key={comment.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <button onClick={() => router.push(`/profile/${comment.user_id}`)} className="min-w-0 text-left">
                          <p className="font-bold text-slate-900 hover:text-blue-600">{commentAuthor?.full_name || "Engineering Student"}</p>
                          <p className="mt-1 text-sm text-slate-400">
                            {new Date(comment.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </button>
                        {currentUserId === comment.user_id && (
                          <button onClick={() => deleteComment(comment.id)} className="shrink-0 text-xs font-bold text-slate-400 hover:text-red-600">
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{comment.content}</p>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
