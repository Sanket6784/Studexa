"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function NewArticlePage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Engineering");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      setAuthorized(false);
      return;
    }

    setAuthorized(true);
  }

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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to publish.");
      setSaving(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      setError("Only the Studexa administrator can publish articles.");
      setSaving(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        category,
      })
      .select()
      .single();

    if (insertError) {
      console.error(insertError);
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push(`/community/${data.id}`);
  }

  if (authorized === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="font-bold text-slate-400">Checking publishing access...</p>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center backdrop-blur-xl">
          <div className="text-5xl">🔒</div>
          <h1 className="mt-5 text-3xl font-black">Publishing is restricted</h1>
          <p className="mt-3 leading-7 text-slate-400">Only the Studexa administrator can publish articles and blogs.</p>
          <button onClick={() => router.push("/community")} className="mt-7 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-500">Back to Community</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <button onClick={() => router.push("/community")} className="text-xl font-extrabold tracking-tight sm:text-2xl">Studexa<span className="text-blue-500">.</span></button>
          <button onClick={() => router.push("/community")} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">← Community</button>
        </div>
      </nav>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-blue-400 sm:text-sm">ADMIN PUBLISHING</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Write an article</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">Only your administrator account can publish to the Studexa community.</p>
        </div>

        {error && <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-semibold text-red-300">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-10 rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl sm:p-8">
          <label className="block text-sm font-bold text-slate-200">
            Article title
            <input required minLength={3} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What do you want to share?" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50" />
          </label>

          <label className="mt-6 block text-sm font-bold text-slate-200">
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none focus:border-blue-500/50">
              <option>Engineering</option><option>Programming</option><option>Career</option><option>Projects</option><option>College Life</option><option>Internships</option><option>Technology</option><option>Other</option>
            </select>
          </label>

          <label className="mt-6 block text-sm font-bold text-slate-200">
            Content
            <textarea required minLength={20} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Start writing your article..." rows={16} className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 leading-7 text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50" />
          </label>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Publishing..." : "Publish Article →"}</button>
            <button type="button" onClick={() => router.push("/community")} className="rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-slate-300 hover:bg-white/10">Cancel</button>
          </div>
        </form>
      </section>
    </main>
  );
}
