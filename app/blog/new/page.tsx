"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function NewBlogPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Engineering");
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

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      title,
      content,
      category,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/dashboard")}
            className="text-2xl font-extrabold text-slate-950"
          >
            Studexa<span className="text-blue-600">.</span>
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            Back to dashboard
          </button>

        </div>
      </nav>

      {/* Blog editor */}
      <section className="mx-auto max-w-4xl px-6 py-12">

        <div className="text-center">

          <p className="text-sm font-bold tracking-widest text-blue-600">
            STUDExA BLOG
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-slate-950">
            Write an article
          </h1>

          <p className="mt-3 text-slate-600">
            Share your engineering knowledge, career journey or experiences.
          </p>

        </div>

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
              placeholder="Example: How I prepared for my first hackathon"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-lg font-semibold text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Category */}
          <div className="mt-6">
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Category
            </label>

            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="Engineering">Engineering</option>
              <option value="Career">Career</option>
              <option value="Internships">Internships</option>
              <option value="Hackathons">Hackathons</option>
              <option value="DSA">DSA</option>
              <option value="Projects">Projects</option>
              <option value="College Life">College Life</option>
              <option value="Technology">Technology</option>
              <option value="Other">Other</option>
            </select>
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
              rows={18}
              className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-4 text-base leading-7 font-medium text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-xs font-medium text-slate-500">
              Write something useful for the Studexa community.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* Publish */}
          <button
            type="submit"
            disabled={saving}
            className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Publishing..." : "Publish article →"}
          </button>

        </form>

      </section>
    </main>
  );
}