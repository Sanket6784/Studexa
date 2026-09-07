"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function NewBlogPage() {
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
      setError("Blog title must be at least 3 characters.");
      return;
    }

    if (content.trim().length < 20) {
      setError("Blog content must be at least 20 characters.");
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
      setError("Only the Technerva administrator can publish blogs.");
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
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] text-slate-950">
        <p className="font-bold text-slate-500">Checking publishing access...</p>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-6 text-slate-950">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">🔒</div>
          <h1 className="mt-5 text-3xl font-black">Publishing is restricted</h1>
          <p className="mt-3 leading-7 text-slate-500">Only the Technerva administrator can publish blogs to the community.</p>
          <button onClick={() => router.push("/community")} className="mt-7 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white hover:bg-slate-800">Back to Community</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <button onClick={() => router.push("/community")} className="flex items-center gap-2.5 text-xl font-black tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm text-white">T</span>
            Technerva
          </button>
          <button onClick={() => router.push("/community")} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">← Community</button>
        </div>
      </nav>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Technerva Blogs</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Write a blog</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">Publish engineering knowledge, experiences and ideas for the Technerva community.</p>
        </div>

        {error && <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <label className="block text-sm font-bold text-slate-700">
            Blog title
            <input required minLength={3} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What do you want to share?" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" />
          </label>

          <label className="mt-6 block text-sm font-bold text-slate-700">
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
              <option>Engineering</option><option>Programming</option><option>Career</option><option>Projects</option><option>College Life</option><option>Internships</option><option>Technology</option><option>Other</option>
            </select>
          </label>

          <label className="mt-6 block text-sm font-bold text-slate-700">
            Content
            <textarea required minLength={20} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Start writing your blog..." rows={16} className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 leading-7 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" />
          </label>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-slate-950 px-6 py-4 font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Publishing..." : "Publish Blog →"}</button>
            <button type="button" onClick={() => router.push("/community")} className="rounded-xl border border-slate-200 bg-white px-6 py-4 font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </section>
    </main>
  );
}
