"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function NewArticlePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to publish an article.");
      setSaving(false);
      return;
    }

    if (!title.trim()) {
      setError("Please enter an article title.");
      setSaving(false);
      return;
    }

    if (!content.trim()) {
      setError("Please write something in your article.");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("articles")
      .insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
      });

    if (insertError) {
      console.error("ARTICLE INSERT ERROR:", insertError);
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/articles");
  }

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

          <button
            onClick={() => router.push("/articles")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            ← Back to Articles
          </button>

        </div>
      </nav>

      {/* Page */}
      <section className="mx-auto max-w-3xl px-6 py-12">

        {/* Header */}
        <div className="text-center">

          <p className="text-sm font-bold tracking-widest text-blue-600">
            SHARE YOUR IDEAS
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-slate-950 md:text-5xl">
            Write an article
          </h1>

          <p className="mt-3 text-lg text-slate-600">
            Share something you've learned, built or experienced.
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >

          {/* Title */}
          <div>

            <label
              htmlFor="title"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Article title
            </label>

            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="For example: What I learned building my first Next.js app"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-semibold text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Content */}
          <div className="mt-6">

            <label
              htmlFor="content"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Article
            </label>

            <textarea
              id="content"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your article..."
              rows={14}
              className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-4 text-base leading-7 text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-xs font-medium text-slate-500">
              Write clearly and share something useful with the community.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={() => router.push("/articles")}
              disabled={saving}
              className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Publishing..." : "Publish Article →"}
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}