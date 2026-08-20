"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Article = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string | null;
  created_at: string;
};

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadArticle() {
      if (!id) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: articleData, error: articleError } =
        await supabase
          .from("posts")
          .select("*")
          .eq("id", id)
          .single();

      if (articleError || !articleData) {
        console.error(articleError);
        setError("Article not found.");
        setLoading(false);
        return;
      }

      setArticle(articleData);

      // Get like count
      const { count, error: countError } = await supabase
        .from("article_likes")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("article_id", id);

      if (countError) {
        console.error(countError);
      } else {
        setLikeCount(count || 0);
      }

      // Check whether current user liked it
      if (user) {
        const { data: existingLike, error: likeError } =
          await supabase
            .from("article_likes")
            .select("id")
            .eq("article_id", id)
            .eq("user_id", user.id)
            .maybeSingle();

        if (likeError) {
          console.error(likeError);
        } else {
          setLiked(!!existingLike);
        }
      }

      setLoading(false);
    }

    loadArticle();
  }, [id]);

  async function toggleLike() {
    if (liking) return;

    setLiking(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (liked) {
      const { error } = await supabase
        .from("article_likes")
        .delete()
        .eq("article_id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        setError("Could not remove your like.");
        setLiking(false);
        return;
      }

      setLiked(false);
      setLikeCount((count) => Math.max(0, count - 1));
    } else {
      const { error } = await supabase
        .from("article_likes")
        .insert({
          article_id: id,
          user_id: user.id,
        });

      if (error) {
        console.error(error);
        setError(error.message);
        setLiking(false);
        return;
      }

      setLiked(true);
      setLikeCount((count) => count + 1);
    }

    setLiking(false);
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

  if (!article) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">

        <h1 className="text-4xl font-extrabold text-slate-950">
          Article not found
        </h1>

        <p className="mt-3 text-slate-600">
          This article does not exist or has been removed.
        </p>

        <button
          onClick={() => router.push("/community")}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
        >
          Back to Community
        </button>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/community")}
            className="text-2xl font-extrabold text-slate-950"
          >
            Studexa<span className="text-blue-600">.</span>
          </button>

          <button
            onClick={() => router.push("/community")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            Community
          </button>

        </div>
      </nav>

      {/* Article */}
      <article className="mx-auto max-w-3xl px-6 py-12">

        {/* Category */}
        {article.category && (
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
            {article.category}
          </span>
        )}

        {/* Title */}
        <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-950 md:text-5xl">
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

        {/* Like */}
        <div className="mt-8 flex items-center gap-4">

          <button
            onClick={toggleLike}
            disabled={liking}
            className={`rounded-xl px-5 py-3 font-bold transition ${
              liked
                ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
            }`}
          >
            {liked ? "❤️ Liked" : "🤍 Like"}
          </button>

          <span className="font-bold text-slate-600">
            {likeCount} {likeCount === 1 ? "like" : "likes"}
          </span>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="whitespace-pre-wrap text-lg leading-8 text-slate-700">
            {article.content}
          </div>

        </div>

      </article>

    </main>
  );
}