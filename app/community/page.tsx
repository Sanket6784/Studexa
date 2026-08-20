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
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-bold text-slate-900">
          Loading Studexa community...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/dashboard")}
            className="text-2xl font-extrabold text-slate-950"
          >
            Studexa<span className="text-blue-600">.</span>
          </button>

          <div className="flex gap-3">

            <button
              onClick={() => router.push("/community/new")}
              className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              + Write Article
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-800 hover:bg-slate-50"
            >
              Dashboard
            </button>

          </div>

        </div>
      </nav>

      {/* Header */}
      <section className="mx-auto max-w-4xl px-6 py-12">

        <p className="text-sm font-bold tracking-widest text-blue-600">
          STUDEXA COMMUNITY
        </p>

        <h1 className="mt-2 text-4xl font-extrabold text-slate-950 md:text-5xl">
          Learn. Build. Grow.
        </h1>

        <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
          Discover ideas, experiences and knowledge shared by students.
        </p>

        <div className="mt-6 flex items-center justify-between">

          <p className="text-sm font-bold text-slate-500">
            {posts.length}{" "}
            {posts.length === 1 ? "article" : "articles"}
          </p>

          <button
            onClick={() => router.push("/community/new")}
            className="font-bold text-blue-600 hover:text-blue-700"
          >
            Share your knowledge →
          </button>

        </div>

        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Empty State */}
        {posts.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

            <div className="text-5xl">📝</div>

            <h2 className="mt-5 text-2xl font-extrabold text-slate-950">
              No articles yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-600">
              Be the first student to share something with the Studexa
              community.
            </p>

            <button
              onClick={() => router.push("/community/new")}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
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
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-md"
              >

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-3">

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
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
                <h2 className="mt-4 text-2xl font-extrabold text-slate-950 md:text-3xl">
                  {post.title}
                </h2>

                {/* Author */}
                <button
                  onClick={() =>
                    router.push(`/profile/${post.user_id}`)
                  }
                  className="mt-3 text-left"
                >
                  <p className="font-bold text-blue-600 hover:text-blue-700">
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
                <p className="mt-5 line-clamp-4 whitespace-pre-wrap leading-7 text-slate-700">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">

                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                      post.likedByMe
                        ? "bg-red-50 text-red-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {post.likedByMe ? "❤️" : "♡"}{" "}
                    {post.likeCount}{" "}
                    {post.likeCount === 1 ? "Like" : "Likes"}
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                  >
                    💬 {post.commentCount}{" "}
                    {post.commentCount === 1 ? "Comment" : "Comments"}
                  </button>

                  <button
                    onClick={() =>
                      router.push(`/community/${post.id}`)
                    }
                    className="ml-auto rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-100"
                  >
                    Read article →
                  </button>

                </div>

                {/* Comments */}
                {openComments[post.id] && (
                  <div className="mt-5 border-t border-slate-100 pt-5">

                    <h3 className="font-extrabold text-slate-950">
                      Comments
                    </h3>

                    <div className="mt-4 space-y-4">

                      {(comments[post.id] || []).map((comment) => (
                        <div
                          key={comment.id}
                          className="rounded-xl bg-slate-50 p-4"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div>
                              <p className="font-bold text-slate-900">
                                {commentAuthors[comment.user_id]
                                  ?.full_name || "Studexa Student"}
                              </p>

                              <p className="mt-1 whitespace-pre-wrap text-slate-700">
                                {comment.content}
                              </p>

                              <p className="mt-2 text-xs text-slate-400">
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
                              className="text-xs font-bold text-red-500 hover:text-red-700"
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
                    <div className="mt-5 flex gap-3">

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
                        className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />

                      <button
                        onClick={() => addComment(post.id)}
                        className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
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