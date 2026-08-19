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
  const [commentText, setCommentText] = useState<
    Record<string, string>
  >({});
  const [openComments, setOpenComments] = useState<
    Record<string, boolean>
  >({});

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

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

    /* -----------------------------
       Load Posts
    ----------------------------- */

    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (postError) {
      console.error(postError);
      setError(postError.message);
      setLoading(false);
      return;
    }

    if (!postData || postData.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    /* -----------------------------
       Load Post Authors
    ----------------------------- */

    const userIds = [
      ...new Set(postData.map((post) => post.user_id)),
    ];

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, college, branch")
      .in("id", userIds);

    /* -----------------------------
       Load Likes
    ----------------------------- */

    const postIds = postData.map((post) => post.id);

    const { data: likesData, error: likesError } =
      await supabase
        .from("post_likes")
        .select("post_id, user_id")
        .in("post_id", postIds);

    if (likesError) {
      console.error(likesError);
    }

    /* -----------------------------
       Load Comments
    ----------------------------- */

    const { data: commentsData, error: commentsError } =
      await supabase
        .from("post_comments")
        .select("*")
        .in("post_id", postIds)
        .order("created_at", { ascending: true });

    if (commentsError) {
      console.error(commentsError);
    }

    /* -----------------------------
       Load Comment Authors
    ----------------------------- */

    const commentUserIds = [
      ...new Set(
        (commentsData || []).map(
          (comment) => comment.user_id
        )
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

    /* -----------------------------
       Group Comments
    ----------------------------- */

    const groupedComments: Record<string, Comment[]> = {};

    (commentsData || []).forEach((comment) => {
      if (!groupedComments[comment.post_id]) {
        groupedComments[comment.post_id] = [];
      }

      groupedComments[comment.post_id].push(comment);
    });

    /* -----------------------------
       Comment Authors Map
    ----------------------------- */

    const authors: Record<string, Profile> = {};

    commentProfileData.forEach((profile) => {
      authors[profile.id] = profile;
    });

    /* -----------------------------
       Combine Everything
    ----------------------------- */

    const combinedPosts = postData.map((post) => {
      const postLikes =
        likesData?.filter(
          (like) => like.post_id === post.id
        ) || [];

      const postComments =
        groupedComments[post.id] || [];

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

  /* -----------------------------
     Like / Unlike
  ----------------------------- */

  async function toggleLike(postId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const currentPost = posts.find(
      (post) => post.id === postId
    );

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
                likeCount: Math.max(
                  0,
                  post.likeCount - 1
                ),
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

  /* -----------------------------
     Add Comment
  ----------------------------- */

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
      [postId]: [
        ...(current[postId] || []),
        newComment,
      ],
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

  /* -----------------------------
     Delete Comment
  ----------------------------- */

  async function deleteComment(
    postId: string,
    commentId: string
  ) {
    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", commentId);

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
              commentCount: Math.max(
                0,
                post.commentCount - 1
              ),
            }
          : post
      )
    );
  }

  /* -----------------------------
     Toggle Comments
  ----------------------------- */

  function toggleComments(postId: string) {
    setOpenComments((current) => ({
      ...current,
      [postId]: !current[postId],
    }));
  }

  /* -----------------------------
     Categories
  ----------------------------- */

  const categories = [
    "All",
    ...Array.from(
      new Set(
        posts
          .map((post) => post.category)
          .filter(Boolean) as string[]
      )
    ),
  ];

  /* -----------------------------
     Search + Filter
  ----------------------------- */

  const filteredPosts = posts.filter((post) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      post.title
        .toLowerCase()
        .includes(searchText) ||
      post.content
        .toLowerCase()
        .includes(searchText) ||
      post.author?.full_name
        ?.toLowerCase()
        .includes(searchText) ||
      post.author?.college
        ?.toLowerCase()
        .includes(searchText) ||
      post.author?.branch
        ?.toLowerCase()
        .includes(searchText);

    const matchesCategory =
      selectedCategory === "All" ||
      post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  /* -----------------------------
     Loading
  ----------------------------- */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-bold text-slate-900">
          Loading Studexa community...
        </p>
      </main>
    );
  }

  /* -----------------------------
     UI
  ----------------------------- */

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
              onClick={() => router.push("/students")}
              className="hidden rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-800 hover:bg-slate-50 md:block"
            >
              Students
            </button>

            <button
              onClick={() => router.push("/blog/new")}
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
      <section className="mx-auto max-w-5xl px-6 py-12">

        <p className="text-sm font-bold tracking-widest text-blue-600">
          STUDEXA COMMUNITY
        </p>

        <h1 className="mt-2 text-4xl font-extrabold text-slate-950 md:text-5xl">
          Learn. Build. Grow.
        </h1>

        <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
          Discover ideas, experiences and knowledge shared by students.
        </p>

        {/* Search */}
        <div className="mt-8">

          <div className="relative">

            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles, students or colleges..."
              className="w-full rounded-2xl border border-slate-300 bg-white px-12 py-4 font-medium text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>

        {/* Categories */}
        <div className="mt-5 flex flex-wrap gap-2">

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {category}
            </button>
          ))}

        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Results count */}
        <div className="mt-7">

          <p className="text-sm font-bold text-slate-500">
            {filteredPosts.length}{" "}
            {filteredPosts.length === 1
              ? "article"
              : "articles"}{" "}
            found
          </p>

        </div>

        {/* Feed */}
        <div className="mt-6 space-y-6">

          {/* No Results */}
          {filteredPosts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <div className="text-4xl">
                🔎
              </div>

              <h2 className="mt-4 text-xl font-extrabold text-slate-950">
                No articles found
              </h2>

              <p className="mt-2 text-slate-600">
                Try a different search or category.
              </p>

              {(search || selectedCategory !== "All") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All");
                  }}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white hover:bg-blue-700"
                >
                  Clear filters
                </button>
              )}

            </div>
          )}

          {/* Posts */}
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >

              {/* Category + Date */}
              <div className="flex flex-wrap items-center gap-3">

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {post.category || "Engineering"}
                </span>

                <span className="text-xs font-medium text-slate-500">
                  {new Date(
                    post.created_at
                  ).toLocaleDateString()}
                </span>

              </div>

              {/* Title */}
              <h2 className="mt-4 text-2xl font-extrabold text-slate-950">
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
                  {post.author?.full_name ||
                    "Studexa Student"}
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
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">

                {/* Like */}
                <button
                  onClick={() =>
                    toggleLike(post.id)
                  }
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${
                    post.likedByMe
                      ? "bg-red-50 text-red-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >

                  <span className="text-lg">
                    {post.likedByMe
                      ? "❤️"
                      : "♡"}
                  </span>

                  {post.likeCount}

                  {post.likeCount === 1
                    ? " Like"
                    : " Likes"}

                </button>

                {/* Comments */}
                <button
                  onClick={() =>
                    toggleComments(post.id)
                  }
                  className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  💬 {post.commentCount}

                  {post.commentCount === 1
                    ? " Comment"
                    : " Comments"}
                </button>

                {/* Read */}
                <button
                  onClick={() =>
                    router.push(`/blog/${post.id}`)
                  }
                  className="rounded-lg px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50"
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

                  {/* Existing comments */}
                  <div className="mt-4 space-y-4">

                    {(comments[post.id] || []).map(
                      (comment) => (
                        <div
                          key={comment.id}
                          className="rounded-xl bg-slate-50 p-4"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div>

                              <button
                                onClick={() =>
                                  router.push(
                                    `/profile/${comment.user_id}`
                                  )
                                }
                                className="font-bold text-slate-900 hover:text-blue-600"
                              >
                                {commentAuthors[
                                  comment.user_id
                                ]?.full_name ||
                                  "Studexa Student"}
                              </button>

                              <p className="mt-1 whitespace-pre-wrap text-slate-700">
                                {comment.content}
                              </p>

                              <p className="mt-2 text-xs text-slate-400">
                                {new Date(
                                  comment.created_at
                                ).toLocaleDateString()}
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
                      )
                    )}

                    {(comments[post.id] || []).length ===
                      0 && (
                      <p className="text-sm text-slate-500">
                        No comments yet. Be the first!
                      </p>
                    )}

                  </div>

                  {/* Add comment */}
                  <div className="mt-5 flex gap-3">

                    <input
                      type="text"
                      value={
                        commentText[post.id] || ""
                      }
                      onChange={(e) =>
                        setCommentText(
                          (current) => ({
                            ...current,
                            [post.id]:
                              e.target.value,
                          })
                        )
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
                      onClick={() =>
                        addComment(post.id)
                      }
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

      </section>

    </main>
  );
}