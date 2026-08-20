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
      setError("You must be logged in to create an article.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("articles").insert({
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
    });

    if (error) {
      console.error(error);
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/community");
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
            Back to Community
          </button>

        </div>
      </nav>

      {/* Page */}
      <section className="mx-auto max-w-3xl px-6 py-12">

        {/* Header */}
        <div className="text-center">

          <p className="text-sm font-bold tracking-widest text-blue-600">
            COMMUNITY
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-slate-950 md:text-5xl">
            Write an article
          </h1>

          <p className="mt-3 text-lg text-slate-600">
            Share something you have learned or experienced.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

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
              minLength={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="For example: What I learned building my first React app"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Content */}
          <div className="mt-6">

            <label
              htmlFor="content"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Content
            </label>

            <textarea
              id="content"
              required
              minLength={20}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article here..."
              rows={14}
              className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium leading-7 text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-xs font-medium text-slate-500">
              Minimum 20 characters.
            </p>

          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Publishing..." : "Publish Article →"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/community")}
              className="rounded-xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-800 hover:bg-slate-50"
            >
              Cancel
            </button>

          </div>

        </form>

      </section>
    </main>
  );
}