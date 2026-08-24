"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

export default function PublishYourWorksPage() {
  const router = useRouter();

  const formUrl = useMemo(
    () => process.env.NEXT_PUBLIC_SUBMISSION_FORM_URL || "",
    []
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="text-2xl font-extrabold tracking-tight">
            Studexa<span className="text-blue-500">.</span>
          </button>
          <button onClick={() => router.back()} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-bold text-slate-300 hover:bg-white/10">
            ← Back
          </button>
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <div className="text-center">
          <p className="text-sm font-bold tracking-[0.2em] text-blue-400">STUDEXA PUBLICATION</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight md:text-6xl">Publish Your Works</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Submit your article or blog for consideration by the Studexa team.
          </p>
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur-xl sm:p-10">
          <h2 className="text-2xl font-black">What the submission form asks for</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {[
              "Name",
              "Age",
              "Institution or workplace",
              "Article or blog title",
              "Manuscript attachment",
              "How you heard about Studexa",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-semibold text-slate-300">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-blue-400/15 bg-blue-500/10 p-5">
            <p className="font-bold text-blue-200">Co-author information</p>
            <p className="mt-2 leading-7 text-slate-400">
              The form provides exactly two choices: <strong className="text-slate-200">Single author</strong> or <strong className="text-slate-200">More than one author</strong>. If more than one author is selected, the form asks how many co-authors there are.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="font-bold text-white">How did you know about us?</p>
            <p className="mt-2 text-slate-400">The form uses four options: Instagram, LinkedIn, Friend/College, and Google/Search.</p>
          </div>

          {formUrl ? (
            <a href={formUrl} target="_blank" rel="noreferrer" className="mt-9 block rounded-xl bg-blue-600 px-6 py-4 text-center font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">
              Open Submission Form →
            </a>
          ) : (
            <div className="mt-9 rounded-xl border border-yellow-400/20 bg-yellow-500/10 px-5 py-4 text-sm font-semibold text-yellow-200">
              The Google Form URL has not been configured yet. Add NEXT_PUBLIC_SUBMISSION_FORM_URL to the environment variables to activate this button.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
