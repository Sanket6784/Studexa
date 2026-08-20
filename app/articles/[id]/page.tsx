"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Article = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
};

type Author = {
  id: string;
  full_name: string;
  college: string | null;
  branch: string | null;
};

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);

  const [likeCount, setLikeCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);

  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadArticle() {
      if (!id) return;

      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Article
      const { data: articleData, error: articleError } =
        await supabase
          .from("articles")
          .select("id, user_id, title, content, created_at")
          .eq("id", id)
          .maybeSingle();

      if (articleError) {
        console.error("ARTICLE ERROR:", articleError);
        setError(articleError.message);
        setLoading(false);
        return;
      }

      if (!articleData) {
        setError("Article not found.");
        setLoading(false);
        return;
      }

      setArticle(articleData);

      // Author profile
      const { data: authorData, error: authorError } =
        await supabase
          .from("profiles")
          .select("id, full_name, college, branch")
          .eq("id", articleData.user_id)
          .maybeSingle();

      if (authorError) {
        console.error("AUTHOR ERROR:", authorError);
      } else if (authorData) {
        setAuthor(authorData);
      }

      // Likes
      const { count, error: likeCountError } =
        await supabase
          .from("article_likes")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("article_id", articleData.id);

      if (likeCountError) {
        console.error("LIKE COUNT ERROR:", likeCountError);
      } else {
        setLikeCount(count || 0);
      }

      // Current user's like
      if (user) {
        const { data: existingLike, error: existingLikeError } =
          await supabase
            .from("article_likes")
            .select("id")
            .eq("article_id", articleData.id)
            .eq("user_id", user.id)
            .maybeSingle();

        if (existingLikeError) {
          console.error("EXISTING LIKE ERROR:", existingLikeError);
        } else {
          setLikedByMe(!!existingLike);
        }
      }

      setLoading(false);
    }

    loadArticle();
  }, [id]);

  async function toggleLike() {
    if (!article || liking) return;

    setLiking(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (likedByMe) {
      const { error } = await supabase
        .from("article_likes")
        .delete()
        .eq("article_id", article.id)
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        setError(error.message);
        setLiking(false);
        return;
      }

      setLikedByMe(false);
      setLikeCount((count) => Math.max(0, count - 1));
    } else {
      const { error } = await supabase
        .from("article_likes")
        .insert({
          article_id: article.id,
          user_id: user.id,
        });

      if (error) {
        console.error(error);
        setError(error.message);
        setLiking(false);
        return;
      }

      setLikedByMe(true);
      setLikeCount((count) => count + 1);
    }

    setLiking(false);
  }

  function viewAuthor() {
    if (!author?.id) {
      setError("This article's author profile is unavailable.");
      return;
    }

    router.push(`/profile/${author.id}`);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-bold text-slate-900">
          Loading article...
        </p>
      </main>
    );
  }

  if (error && !article) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-3xl">

          <button
            onClick={() => router.push("/articles")}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800 hover:bg-slate-50"
          >
            ← Back to Articles
          </button>

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h1 className="text-2xl font-extrabold text-red-700">
              Article unavailable
            </h1>

            <p className="mt-3 text-red-600">
              {error}
            </p>
          </div>

        </div>
      </main>
    );
  }

  if (!article) return null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/")}
            className="text-2xl font-extrabold text-slate-950"
          >
            Studexa<span className="text-blue-600">.</span>
          </button>

          <div className="flex gap-3">

            <button
              onClick={() => router.push("/articles")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              Articles
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="hidden rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 sm:block"
            >
              Dashboard
            </button>

          </div>

        </div>
      </nav>

      {/* Article */}
      <article className="mx-auto max-w-3xl px-6 py-12">

        {/* Author */}
        {author ? (
          <button
            onClick={viewAuthor}
            className="text-left"
          >
            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-lg font-extrabold text-blue-700">
                {author.full_name.charAt(0).toUpperCase()}
              </div>

              <div>

                <p className="font-bold text-slate-900 hover:text-blue-600">
                  {author.full_name}
                </p>

                {(author.college || author.branch) && (
                  <p className="text-sm text-slate-500">
                    {author.college || ""}
                    {author.college && author.branch ? " • " : ""}
                    {author.branch || ""}
                  </p>
                )}

              </div>

            </div>
          </button>
        ) : (
          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-extrabold text-slate-500">
              S
            </div>

            <div>
              <p className="font-bold text-slate-500">
                Studexa Student
              </p>

              <p className="text-sm text-slate-400">
                Profile unavailable
              </p>
            </div>

          </div>
        )}

        {/* Title */}
        <h1 className="mt-8 text-4xl font-extrabold leading-tight text-slate-950 md:text-5xl">
          {article.title}
        </h1>

        {/* Date */}
        <p className="mt-4 text-sm font-medium text-slate-500">
          {new Date(article.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        {/* Actions */}
        <div className="mt-8 flex items-center gap-3 border-y border-slate-200 py-5">

          <button
            onClick={toggleLike}
            disabled={liking}
            className={`rounded-xl px-5 py-3 font-bold transition ${
              likedByMe
                ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
            }`}
          >
            {likedByMe ? "❤️ Liked" : "♡ Like"}
          </button>

          <span className="font-bold text-slate-600">
            {likeCount} {likeCount === 1 ? "like" : "likes"}
          </span>

        </div>

        {/* Action error */}
        {error && article && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">

          <div className="whitespace-pre-wrap text-lg leading-8 text-slate-700">
            {article.content}
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-wrap justify-between gap-4">

          <button
            onClick={() => router.push("/articles")}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800 hover:bg-slate-50"
          >
            ← All Articles
          </button>

          {author && (
            <button
              onClick={viewAuthor}
              className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
            >
              View Author →
            </button>
          )}

        </div>

      </article>

    </main>
  );
}