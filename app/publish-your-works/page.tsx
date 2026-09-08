"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { siteConfig } from "../site-config";

const categories = [
  "Engineering Blog",
  "Project Story",
  "Research & Technical Work",
  "Internship Experience",
  "Hackathon Experience",
  "Engineering Insight",
];

export default function PublishYourWorksPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [workUrl, setWorkUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setChecking(false);
        return;
      }
      setUserId(user.id);
      setEmail(user.email || "");
      const { data: profile } = await supabase.from("profiles").select("full_name,college").eq("id", user.id).maybeSingle();
      if (profile) {
        setName(profile.full_name || "");
        setCollege(profile.college || "");
      }
      setChecking(false);
    })();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!userId) {
      router.push("/login?redirect=/publish-your-works");
      return;
    }
    if (name.trim().length < 2 || title.trim().length < 5 || content.trim().length < 50) {
      setError("Please provide your name, a meaningful title, and at least 50 characters of work.");
      return;
    }
    if (workUrl.trim()) {
      try { new URL(workUrl.trim()); } catch { setError("Please enter a valid work URL or leave it blank."); return; }
    }

    setSaving(true);
    const { error: insertError } = await supabase.from("publication_submissions").insert({
      user_id: userId,
      name: name.trim(),
      college: college.trim() || null,
      email: email.trim() || null,
      category,
      title: title.trim(),
      content: content.trim(),
      work_url: workUrl.trim() || null,
    });

    if (insertError) {
      console.error(insertError);
      setError("We couldn't submit your work. Please try again.");
      setSaving(false);
      return;
    }
    setSubmitted(true);
    setSaving(false);
  }

  if (checking) return <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc]"><p className="font-bold text-slate-500">Loading...</p></main>;

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          <button onClick={() => router.push("/")} className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">T</span><span className="text-xl font-black tracking-tight">Technerva</span></button>
          <button onClick={() => router.back()} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">← Back</button>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Technerva Publications</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Publish your work.</h1>
          <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">Share something you built, researched, learned or experienced. Every submission is reviewed before publication.</p>
        </div>

        {!userId ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">✦</div>
            <h2 className="mt-5 text-2xl font-black">Sign in to submit your work</h2>
            <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-500">A Technerva account lets us associate your submission with your engineering profile and keep you updated about its review.</p>
            <button onClick={() => router.push("/login?redirect=/publish-your-works")} className="mt-7 rounded-xl bg-slate-950 px-6 py-3.5 font-bold text-white hover:bg-slate-800">Sign in & submit →</button>
          </div>
        ) : submitted ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">✓</div>
            <h2 className="mt-5 text-3xl font-black">Submission received.</h2>
            <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-500">Our Publications team will review your work. If it is selected, we’ll publish it and issue your Technerva Publications certificate.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={() => router.push("/dashboard")} className="rounded-xl bg-slate-950 px-6 py-3.5 font-bold text-white hover:bg-slate-800">Go to dashboard</button><button onClick={() => router.push("/")} className="rounded-xl border border-slate-200 px-6 py-3.5 font-bold text-slate-700 hover:bg-slate-50">Back home</button></div>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.35fr]">
            <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div>}
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-bold text-slate-700">Your name<input required value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium text-slate-950 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" placeholder="Your full name" /></label>
                <label className="text-sm font-bold text-slate-700">Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium text-slate-950 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" placeholder="you@example.com" /></label>
              </div>
              <label className="mt-5 block text-sm font-bold text-slate-700">College<input value={college} onChange={e => setCollege(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium text-slate-950 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" placeholder="Your engineering college" /></label>
              <label className="mt-5 block text-sm font-bold text-slate-700">What are you submitting?<select value={category} onChange={e => setCategory(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 font-medium text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">{categories.map(item => <option key={item}>{item}</option>)}</select></label>
              <label className="mt-5 block text-sm font-bold text-slate-700">Work title<input required minLength={5} value={title} onChange={e => setTitle(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium text-slate-950 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" placeholder="Give your work a clear title" /></label>
              <label className="mt-5 block text-sm font-bold text-slate-700">Your work<textarea required minLength={50} rows={14} value={content} onChange={e => setContent(e.target.value)} className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 leading-7 text-slate-950 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" placeholder="Write or paste your work here..." /></label>
              <label className="mt-5 block text-sm font-bold text-slate-700">Supporting link <span className="font-medium text-slate-400">(optional)</span><input type="url" value={workUrl} onChange={e => setWorkUrl(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium text-slate-950 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" placeholder="GitHub, Drive, demo or portfolio link" /></label>
              <button disabled={saving} type="submit" className="mt-7 w-full rounded-xl bg-slate-950 px-6 py-4 font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Submitting..." : "Submit for review →"}</button>
            </form>

            <aside className="h-fit rounded-3xl border border-slate-200 bg-slate-950 p-7 text-white sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">What happens next?</p>
              <div className="mt-6 space-y-5">
                {["Your submission is received", "Technerva Publications reviews it", "Approved work is published", "You receive a publication certificate"].map((step, index) => <div key={step} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-black">{index + 1}</span><p className="pt-1 text-sm font-semibold leading-5 text-slate-300">{step}</p></div>)}
              </div>
              <div className="mt-7 border-t border-white/10 pt-6"><p className="text-sm font-bold text-slate-300">Publications</p><p className="mt-2 text-xs leading-5 text-slate-500">{siteConfig.publicationEmail}</p><a href={siteConfig.publicationInstagram} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-bold text-blue-300">Instagram · @Technervapublications</a></div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
