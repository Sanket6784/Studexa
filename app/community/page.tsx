"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

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
};

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

type CommunityPost = Post & {
  author: Profile | null;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
};

export default function CommunityPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentAuthors, setCommentAuthors] = useState<
    Record<string, Profile>
  >({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCommunity();
  }, []);

  async function loadCommunity() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (postError) {
      console.error(postError);
      setError("Could not load the community.");
      setLoading(false);
      return;
    }

    if (!postData || postData.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(postData.map((post) => post.user_id))];

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, college, branch")
      .in("id", userIds);

    const postIds = postData.map((post) => post.id);

    const { data: likesData, error: likesError } = await supabase
      .from("post_likes")
      .select("post_id, user_id")
      .in("post_id", postIds);

    if (likesError) {
      console.error(likesError);
    }

    const { data: commentsData, error: commentsError } = await supabase
      .from("post_comments")
      .select("*")
      .in("post_id", postIds)
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.error(commentsError);
    }

    const commentUserIds = [
      ...new Set(
        (commentsData || []).map((comment) => comment.user_id)
      ),
    ];

    let commentProfileData: Profile[] = [];

    if (commentUserIds.length > 0) {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, college, branch")
        .in("id", commentUserIds);

      commentProfileData = data || [];
    }

    const groupedComments: Record<string, Comment[]> = {};

    (commentsData || []).forEach((comment) => {
      if (!groupedComments[comment.post_id]) {
        groupedComments[comment.post_id] = [];
      }

      groupedComments[comment.post_id].push(comment);
    });

    const authors: Record<string, Profile> = {};

    commentProfileData.forEach((profile) => {
      authors[profile.id] = profile;
    });

    const combinedPosts = postData.map((post) => {
      const postLikes =
        likesData?.filter((like) => like.post_id === post.id) || [];

      const postComments = groupedComments[post.id] || [];

      return {
        ...post,
        author:
          profileData?.find(
            (profile) => profile.id === post.user_id
          ) || null,
        likeCount: postLikes.length,
        likedByMe: postLikes.some(
          (like) => like.user_id === user.id
        ),
        commentCount: postComments.length,
      };
    });

    setComments(groupedComments);
    setCommentAuthors(authors);
    setPosts(combinedPosts);
    setLoading(false);
  }

  async function toggleLike(postId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const currentPost = posts.find((post) => post.id === postId);

    if (!currentPost) return;

    if (currentPost.likedByMe) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        return;
      }

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likedByMe: false,
                likeCount: Math.max(0, post.likeCount - 1),
              }
            : post
        )
      );
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

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likedByMe: true,
                likeCount: post.likeCount + 1,
              }
            : post
        )
      );
    }
  }

  async function addComment(postId: string) {
    const text = commentText[postId]?.trim();

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
      console.error(error);
      return;
    }

    const newComment: Comment = data;

    setComments((current) => ({
      ...current,
      [postId]: [...(current[postId] || []), newComment],
    }));

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, college, branch")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setCommentAuthors((current) => ({
        ...current,
        [user.id]: profileData,
      }));
    }

    setCommentText((current) => ({
      ...current,
      [postId]: "",
    }));

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              commentCount: post.commentCount + 1,
            }
          : post
      )
    );
  }

  async function deleteComment(postId: string, commentId: string) {
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
      console.error(error);
      return;
    }

    setComments((current) => ({
      ...current,
      [postId]: (current[postId] || []).filter(
        (comment) => comment.id !== commentId
      ),
    }));

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              commentCount: Math.max(0, post.commentCount - 1),
            }
          : post
      )
    );
  }

  function toggleComments(postId: string) {
    setOpenComments((current) => ({
      ...current,
      [postId]: !current[postId],
    }));
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

          <p className="mt-5 text-lg font-bold text-slate-300">
            Loading Studexa community...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute left-1/2 top-[-250px] h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="absolute right-[-200px] top-[450px] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[-200px] h-[450px] w-[450px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">

          <button
            onClick={() => router.push("/dashboard")}
            className="shrink-0 text-xl font-extrabold tracking-tight text-white sm:text-2xl"
          >
            Studexa<span className="text-blue-500">.</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">

            <button
              onClick={() => router.push("/community/new")}
              className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 sm:px-4 sm:text-sm"
            >
              + Write Article
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 backdrop-blur-xl transition hover:bg-white/10 sm:px-4 sm:text-sm"
            >
              Dashboard
            </button>

          </div>

        </div>
      </nav>

      {/* Header */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">

        <p className="text-xs font-bold tracking-[0.2em] text-blue-400 sm:text-sm">
          STUDEXA COMMUNITY
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
          Learn. Build.{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
            Grow.
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
          Discover ideas, experiences and knowledge shared by students.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-sm font-bold text-slate-500">
            {posts.length}{" "}
            {posts.length === 1 ? "article" : "articles"}
          </p>

          <button
            onClick={() => router.push("/community/new")}
            className="self-start font-bold text-blue-400 transition hover:text-blue-300 sm:self-auto"
          >
            Share your knowledge →
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 font-semibold text-red-300 backdrop-blur-xl">
            {error}
          </div>
        )}

        {/* Empty State */}
        {posts.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-10 text-center backdrop-blur-xl sm:p-14">

            <div className="text-5xl">📝</div>

            <h2 className="mt-5 text-2xl font-black text-white">
              No articles yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-400">
              Be the first student to share something with the Studexa
              community.
            </p>

            <button
              onClick={() => router.push("/community/new")}
              className="mt-7 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              Write the First Article →
            </button>

          </div>
        ) : (

          /* Feed */
          <div className="mt-10 space-y-6">

            {posts.map((post) => (
              <article
                key={post.id}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-400/20 hover:bg-white/[0.07] sm:p-7"
              >

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-3">

                  <span className="rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                    {post.category || "Engineering"}
                  </span>

                  <span className="text-xs font-medium text-slate-500">
                    {new Date(post.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>

                </div>

                {/* Title */}
                <h2 className="mt-5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {post.title}
                </h2>

                {/* Author */}
                <button
                  onClick={() =>
                    router.push(`/profile/${post.user_id}`)
                  }
                  className="mt-4 text-left"
                >
                  <p className="font-bold text-blue-400 transition hover:text-blue-300">
                    {post.author?.full_name || "Studexa Student"}
                  </p>

                  {post.author?.college && (
                    <p className="mt-1 text-sm text-slate-500">
                      {post.author.college}
                      {post.author.branch &&
                        ` • ${post.author.branch}`}
                    </p>
                  )}
                </button>

                {/* Preview */}
                <p className="mt-5 line-clamp-4 whitespace-pre-wrap leading-7 text-slate-400">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5">

                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                      post.likedByMe
                        ? "bg-red-500/10 text-red-400"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {post.likedByMe ? "❤️" : "♡"}{" "}
                    {post.likeCount}{" "}
                    {post.likeCount === 1 ? "Like" : "Likes"}
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-400 transition hover:bg-white/5 hover:text-white"
                  >
                    💬 {post.commentCount}{" "}
                    {post.commentCount === 1
                      ? "Comment"
                      : "Comments"}
                  </button>

                  <button
                    onClick={() =>
                      router.push(`/community/${post.id}`)
                    }
                    className="ml-auto rounded-xl bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-300 transition hover:bg-blue-500/20"
                  >
                    Read article →
                  </button>

                </div>

                {/* Comments */}
                {openComments[post.id] && (
                  <div className="mt-5 border-t border-white/10 pt-5">

                    <h3 className="font-black text-white">
                      Comments
                    </h3>

                    <div className="mt-4 space-y-4">

                      {(comments[post.id] || []).map((comment) => (
                        <div
                          key={comment.id}
                          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="min-w-0">

                              <p className="font-bold text-white">
                                {commentAuthors[comment.user_id]
                                  ?.full_name || "Studexa Student"}
                              </p>

                              <p className="mt-1 whitespace-pre-wrap text-slate-400">
                                {comment.content}
                              </p>

                              <p className="mt-2 text-xs text-slate-600">
                                {new Date(
                                  comment.created_at
                                ).toLocaleDateString("en-IN")}
                              </p>

                            </div>

                            <button
                              onClick={() =>
                                deleteComment(
                                  post.id,
                                  comment.id
                                )
                              }
                              className="shrink-0 text-xs font-bold text-red-400 transition hover:text-red-300"
                            >
                              Delete
                            </button>

                          </div>

                        </div>
                      ))}

                      {(comments[post.id] || []).length === 0 && (
                        <p className="text-sm text-slate-500">
                          No comments yet. Be the first!
                        </p>
                      )}

                    </div>

                    {/* Add Comment */}
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                      <input
                        type="text"
                        value={commentText[post.id] || ""}
                        onChange={(e) =>
                          setCommentText((current) => ({
                            ...current,
                            [post.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addComment(post.id);
                          }
                        }}
                        placeholder="Write a comment..."
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                      />

                      <button
                        onClick={() => addComment(post.id)}
                        className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500"
                      >
                        Comment
                      </button>

                    </div>

                  </div>
                )}

              </article>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}