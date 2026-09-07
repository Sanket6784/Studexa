"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "../site-config";

export default function PublishYourWorksPage() {
  const router = useRouter();

  const formUrl = useMemo(
    () => process.env.NEXT_PUBLIC_SUBMISSION_FORM_URL || "",
    []
  );

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          <button onClick={() => router.push("/")} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">T</span>
            <span className="text-xl font-black tracking-tight">Technerva</span>
          </button>
          <button onClick={() => router.back()} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
            ← Back
          </button>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Technerva Publications</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.04em] md:text-6xl">Publish your work.</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Have an engineering blog, project story, research piece, internship experience or technical work worth sharing? Send it to the Technerva Publications team for consideration.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">How to submit</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Email your work directly.</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Include your name, college, a short introduction and the work you want us to review. For a blog, attach the manuscript or share the document. We will review submissions before publication.
            </p>

            <a href={`mailto:${siteConfig.publicationEmail}?subject=Technerva%20Publications%20Submission`} className="mt-8 block rounded-2xl border border-blue-100 bg-blue-50 p-5 transition hover:border-blue-200 hover:bg-blue-100/70">
              <p className="text-xs font-black uppercase tracking-wider text-blue-600">Submission email</p>
              <p className="mt-2 break-all text-lg font-extrabold text-slate-950">{siteConfig.publicationEmail}</p>
              <p className="mt-2 text-sm font-semibold text-blue-700">Click to email your submission →</p>
            </a>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="font-bold text-slate-950">What you can submit</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {["Engineering blogs", "Project stories", "Research & technical work", "Internship experiences", "Hackathon experiences", "Engineering insights"].map((item) => (
                  <div key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">{item}</div>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-7 text-white shadow-sm sm:p-9">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">Technerva Publications</p>
            <h2 className="mt-4 text-2xl font-black">Share what you build and learn.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Selected submissions may be published on Technerva so other engineering students can learn from your work and experience.
            </p>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-sm font-bold text-slate-300">Follow publications</p>
              <a href={siteConfig.publicationInstagram} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-bold text-blue-300 hover:text-blue-200">Instagram · @Technervapublications</a>
            </div>

            {formUrl && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs leading-5 text-slate-500">A submission form is also available.</p>
                <a href={formUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-bold text-white underline decoration-white/30 hover:decoration-white">Open submission form →</a>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
