"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Article = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
};

type Profile = {
  id: string;
  full_name: string;
};

type ArticleWithAuthor = Article & {
  author: string;
};

export default function ArticlesPage() {
  const router = useRouter();

  const [articles, setArticles] = useState<ArticleWithAuthor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadArticles() {
      setLoading(true);
      setError("");

      const { data: articleData, error: articleError } =
        await supabase
          .from("articles")
          .select("id, title, content, created_at, user_id")
          .order("created_at", { ascending: false });

      if (articleError) {
        console.error("ARTICLES ERROR:", articleError);
        setError("Could not load articles.");
        setLoading(false);
        return;
      }

      if (!articleData || articleData.length === 0) {
        setArticles([]);
        setLoading(false);
        return;
      }

      const userIds = [
        ...new Set(articleData.map((article) => article.user_id)),
      ];

      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

      if (profileError) {
        console.error("PROFILE ERROR:", profileError);
      }

      const profiles = (profileData || []) as Profile[];

      const articlesWithAuthors: ArticleWithAuthor[] =
        articleData.map((article) => {
          const author = profiles.find(
            (profile) => profile.id === article.user_id
          );

          return {
            ...article,
            author: author?.full_name || "Student",
          };
        });

      setArticles(articlesWithAuthors);
      setLoading(false);
    }

    loadArticles();
  }, []);

  const filteredArticles = articles.filter((article) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return true;

    return (
      article.title.toLowerCase().includes(searchText) ||
      article.content.toLowerCase().includes(searchText) ||
      article.author.toLowerCase().includes(searchText)
    );
  });

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/")}
            className="text-2xl font-extrabold text-slate-950"
          >
            Studexa<span className="text-blue-600">.</span>
          </button>

          <div className="flex items-center gap-3">

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              Dashboard
            </button>

            <button
              onClick={() => router.push("/students")}
              className="hidden rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 md:block"
            >
              Students
            </button>

          </div>

        </div>
      </nav>

      {/* Page */}
      <section className="mx-auto max-w-6xl px-6 py-12">

        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

          <div className="max-w-3xl">

            <p className="text-sm font-bold tracking-widest text-blue-600">
              STUDEXA ARTICLES
            </p>

            <h1 className="mt-3 text-4xl font-extrabold text-slate-950 md:text-5xl">
              Ideas worth sharing
            </h1>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              Read what students are learning, building and thinking about.
            </p>

          </div>

          {/* Create Article */}
          <button
            onClick={() => router.push("/articles/new")}
            className="rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Write Article
          </button>

        </div>

        {/* Search */}
        <div className="mt-8 max-w-3xl">

          <div className="relative">

            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles or authors..."
              className="w-full rounded-2xl border border-slate-300 bg-white px-12 py-4 text-base font-medium text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>

        {/* Results */}
        <div className="mt-8">

          <p className="text-sm font-bold text-slate-500">
            {filteredArticles.length}{" "}
            {filteredArticles.length === 1
              ? "article"
              : "articles"}{" "}
            found
          </p>

        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <p className="font-semibold text-slate-700">
              Loading articles...
            </p>

          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">

            <p className="font-semibold text-red-700">
              {error}
            </p>

          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          articles.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <div className="text-5xl">
                ✍️
              </div>

              <h2 className="mt-5 text-2xl font-extrabold text-slate-950">
                No articles yet
              </h2>

              <p className="mt-3 text-slate-600">
                Be the first student to share something with the community.
              </p>

              <button
                onClick={() => router.push("/articles/new")}
                className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
              >
                Write the first article →
              </button>

            </div>
          )}

        {/* No Search Results */}
        {!loading &&
          !error &&
          articles.length > 0 &&
          filteredArticles.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <div className="text-4xl">
                🔎
              </div>

              <h2 className="mt-4 text-xl font-extrabold text-slate-950">
                No articles found
              </h2>

              <p className="mt-2 text-slate-600">
                Try another search term.
              </p>

            </div>
          )}

        {/* Article Cards */}
        {!loading &&
          !error &&
          filteredArticles.length > 0 && (
            <div className="mt-6 grid gap-6 md:grid-cols-2">

              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >

                  {/* Author */}
                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 font-extrabold text-blue-700">
                      {article.author
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>

                      <p className="font-bold text-slate-900">
                        {article.author}
                      </p>

                      <p className="text-xs font-medium text-slate-500">
                        {formatDate(article.created_at)}
                      </p>

                    </div>

                  </div>

                  {/* Title */}
                  <h2 className="mt-6 text-2xl font-extrabold leading-tight text-slate-950">
                    {article.title}
                  </h2>

                  {/* Content Preview */}
                  <p className="mt-4 line-clamp-4 leading-7 text-slate-600">
                    {article.content}
                  </p>

                  {/* Read Button */}
                  <button
                    onClick={() =>
                      router.push(`/articles/${article.id}`)
                    }
                    className="mt-6 font-bold text-blue-600 hover:text-blue-700"
                  >
                    Read article →
                  </button>

                </article>
              ))}

            </div>
          )}

      </section>

    </main>
  );
}