"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function NewArticlePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Engineering");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }

    if (content.trim().length < 20) {
      setError("Article content must be at least 20 characters.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to create an article.");
      setSaving(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        category: category,
      })
      .select()
      .single();

    if (insertError) {
      console.error("CREATE POST ERROR:", insertError);
      setError(insertError.message);
      setSaving(false);
      return;
    }

    console.log("Created post:", data);

    router.push(`/community/${data.id}`);
  }

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
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">

          <button
            onClick={() => router.push("/community")}
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

      {/* Page */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">

        {/* Header */}
        <div className="text-center">

          <p className="text-xs font-bold tracking-[0.2em] text-blue-400 sm:text-sm">
            STUDEXA COMMUNITY
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Write an article
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            Share what you've learned, built or experienced with other
            students.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-bold text-slate-200"
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
              placeholder="What do you want to share?"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 font-medium text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          {/* Category */}
          <div className="mt-6">

            <label
              htmlFor="category"
              className="mb-2 block text-sm font-bold text-slate-200"
            >
              Category
            </label>

            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 font-medium text-white outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="Engineering">Engineering</option>
              <option value="Programming">Programming</option>
              <option value="Career">Career</option>
              <option value="Projects">Projects</option>
              <option value="College Life">College Life</option>
              <option value="Internships">Internships</option>
              <option value="Technology">Technology</option>
              <option value="Other">Other</option>
            </select>

          </div>

          {/* Content */}
          <div className="mt-6">

            <label
              htmlFor="content"
              className="mb-2 block text-sm font-bold text-slate-200"
            >
              Content
            </label>

            <textarea
              id="content"
              required
              minLength={20}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your article..."
              rows={16}
              className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 font-medium leading-7 text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/10"
            />

            <div className="mt-2 flex justify-between text-xs font-medium text-slate-600">
              <span>Minimum 20 characters</span>
              <span>{content.length} characters</span>
            </div>

          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Publishing..." : "Publish Article →"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/community")}
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}