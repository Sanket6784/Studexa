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

export default function ArticlePage() {
  const router = useRouter();
  const params = useParams();

  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentAuthors, setCommentAuthors] = useState<
    Record<string, Profile>
  >({});

  const [commentText, setCommentText] = useState("");

  const [likeCount, setLikeCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (postId) {
      loadArticle();
    }
  }, [postId]);

  async function loadArticle() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setCurrentUserId(user.id);

    // Get post
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .maybeSingle();

    if (postError) {
      console.error("POST ERROR:", postError);
      setError("Could not load this article.");
      setLoading(false);
      return;
    }

    if (!postData) {
      setPost(null);
      setLoading(false);
      return;
    }

    setPost(postData);

    // Get author
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, college, branch, avatar_url")
      .eq("id", postData.user_id)
      .maybeSingle();

    if (profileError) {
      console.error("PROFILE ERROR:", profileError);
    }

    setAuthor(profileData || null);

    // Get likes
    const { data: likesData, error: likesError } = await supabase
      .from("post_likes")
      .select("user_id")
      .eq("post_id", postId);

    if (likesError) {
      console.error("LIKES ERROR:", likesError);
    }

    setLikeCount(likesData?.length || 0);

    setLikedByMe(
      (likesData || []).some(
        (like) => like.user_id === user.id
      )
    );

    // Get comments
    const { data: commentsData, error: commentsError } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.error("COMMENTS ERROR:", commentsError);
    }

    const loadedComments = commentsData || [];

    setComments(loadedComments);

    // Get comment authors
    const commentUserIds = [
      ...new Set(
        loadedComments.map((comment) => comment.user_id)
      ),
    ];

    if (commentUserIds.length > 0) {
      const {
        data: commentProfiles,
        error: commentProfilesError,
      } = await supabase
        .from("profiles")
        .select("id, full_name, college, branch, avatar_url")
        .in("id", commentUserIds);

      if (commentProfilesError) {
        console.error(
          "COMMENT PROFILE ERROR:",
          commentProfilesError
        );
      }

      const authorsMap: Record<string, Profile> = {};

      (commentProfiles || []).forEach((profile) => {
        authorsMap[profile.id] = profile;
      });

      setCommentAuthors(authorsMap);
    }

    setLoading(false);
  }

  async function toggleLike() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

      if (error) {
        console.error(error);
        return;
      }

      setLikedByMe(false);
      setLikeCount((count) => Math.max(0, count - 1));
    } else {
      const { error } = await supabase
        .from("post_likes")
        .insert({
          post_id: postId,
          user_id: user.id,
        });

      if (error) {
        console.error(error);
        return;
      }

      setLikedByMe(true);
      setLikeCount((count) => count + 1);
    }
  }

  async function addComment() {
    const text = commentText.trim();

    if (!text) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content: text,
      })
      .select()
      .single();

    if (error) {
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
      setCommentAuthors((current) => ({
        ...current,
        [user.id]: profileData,
      }));
    }

    setCommentText("");
  }

  async function deleteComment(commentId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id);

    if (error) {
      console.error("DELETE COMMENT ERROR:", error);
      return;
    }

    setComments((current) =>
      current.filter((comment) => comment.id !== commentId)
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

          <p className="mt-5 font-bold text-slate-300">
            Loading article...
          </p>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.05] p-10 text-center shadow-2xl backdrop-blur-xl">

          <div className="text-5xl">📄</div>

          <h1 className="mt-6 text-3xl font-black">
            Article not found
          </h1>

          <p className="mt-3 leading-7 text-slate-400">
            This article may have been removed or doesn't exist.
          </p>

          <button
            onClick={() => router.push("/community")}
            className="mt-8 w-full rounded-xl bg-blue-600 px-5 py-4 font-bold text-white transition hover:bg-blue-500"
          >
            Back to Community
          </button>

        </div>
      </main>
    );
  }

  const isOwner = currentUserId === post.user_id;

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="absolute right-[-200px] top-[400px] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[-200px] h-[450px] w-[450px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">

          <button
            onClick={() => router.push("/dashboard")}
            className="text-xl font-extrabold tracking-tight text-white sm:text-2xl"
          >
            Studexa<span className="text-blue-500">.</span>
          </button>

          <button
            onClick={() => router.push("/community")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/10"
          >
            ← Community
          </button>

        </div>
      </nav>

      {/* Article */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">

        {/* Category + Date */}
        <div className="flex flex-wrap items-center gap-3">

          <span className="rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
            {post.category || "Engineering"}
          </span>

          <span className="text-sm text-slate-500">
            {new Date(post.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>

        </div>

        {/* Title */}
        <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
          {post.title}
        </h1>

        {/* Author */}
        <button
          onClick={() => router.push(`/profile/${post.user_id}`)}
          className="mt-7 flex items-center gap-4 text-left"
        >

          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-blue-500/10 font-black text-blue-400">

            {author?.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              author?.full_name?.charAt(0).toUpperCase() || "S"
            )}

          </div>

          <div>
            <p className="font-bold text-white">
              {author?.full_name || "Studexa Student"}
            </p>

            <p className="text-sm text-slate-500">
              {author?.college || "Studexa"}
              {author?.branch && ` • ${author.branch}`}
            </p>
          </div>

        </button>

        {/* Owner Controls */}
        {isOwner && (
          <div className="mt-6 flex flex-wrap gap-3">

            <button
              onClick={() =>
                router.push(`/community/${post.id}/edit`)
              }
              className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-5 py-3 text-sm font-bold text-blue-300 transition hover:bg-blue-500/20"
            >
              ✏️ Edit Article
            </button>

          </div>
        )}

        {/* Article Content */}
        <article className="mt-8 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-xl sm:p-10">

          <div className="whitespace-pre-wrap text-base leading-8 text-slate-300 sm:text-lg sm:leading-9">
            {post.content}
          </div>

          {/* Like */}
          <div className="mt-10 border-t border-white/10 pt-6">

            <button
              onClick={toggleLike}
              className={`rounded-xl px-5 py-3 font-bold transition ${
                likedByMe
                  ? "bg-red-500/10 text-red-400"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {likedByMe ? "❤️" : "♡"} {likeCount}{" "}
              {likeCount === 1 ? "Like" : "Likes"}
            </button>

          </div>

        </article>

        {/* Comments */}
        <section className="mt-10">

          <h2 className="text-2xl font-black">
            Comments
            <span className="ml-2 text-base text-slate-500">
              {comments.length}
            </span>
          </h2>

          {/* Add Comment */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">

            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addComment();
                }
              }}
              placeholder="Write a comment..."
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500/50"
            />

            <button
              onClick={addComment}
              className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-500"
            >
              Comment
            </button>

          </div>

          {/* Comment List */}
          <div className="mt-6 space-y-4">

            {comments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="text-slate-500">
                  No comments yet. Be the first to comment.
                </p>
              </div>
            ) : (
              comments.map((comment) => {
                const commentAuthor =
                  commentAuthors[comment.user_id];

                return (
                  <div
                    key={comment.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <button
                          onClick={() =>
                            router.push(
                              `/profile/${comment.user_id}`
                            )
                          }
                          className="font-bold text-white hover:text-blue-400"
                        >
                          {commentAuthor?.full_name ||
                            "Studexa Student"}
                        </button>

                        <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-400">
                          {comment.content}
                        </p>

                        <p className="mt-2 text-xs text-slate-600">
                          {new Date(
                            comment.created_at
                          ).toLocaleDateString("en-IN")}
                        </p>

                      </div>

                      {/* Only comment owner can delete */}
                      {currentUserId === comment.user_id && (
                        <button
                          onClick={() =>
                            deleteComment(comment.id)
                          }
                          className="shrink-0 text-xs font-bold text-red-400 transition hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}

                    </div>

                  </div>
                );
              })
            )}

          </div>

        </section>

      </section>

    </main>
  );
}