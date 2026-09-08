"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Submission = { id: string; user_id: string; name: string; college: string | null; title: string; category: string; status: string; certificate_id: string | null; certificate_issued_at: string | null; post_id: string | null };

export default function CertificatePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("publication_submissions").select("id,user_id,name,college,title,category,status,certificate_id,certificate_issued_at,post_id").eq("id", params.id).single();
      if (data && data.status === "approved" && data.certificate_id) setSubmission(data as Submission);
      setLoading(false);
    })();
  }, [params.id]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-slate-100"><p className="font-bold text-slate-500">Loading certificate...</p></main>;
  if (!submission) return <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6"><div className="text-center"><h1 className="text-3xl font-black">Certificate unavailable</h1><p className="mt-3 text-slate-500">This certificate has not been issued or the certificate ID is invalid.</p><button onClick={() => router.push("/")} className="mt-6 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white">Back home</button></div></main>;

  const date = submission.certificate_issued_at ? new Date(submission.certificate_issued_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "";
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-8 sm:py-12 print:bg-white print:p-0">
      <div className="mx-auto mb-5 flex max-w-5xl justify-between print:hidden"><button onClick={() => router.back()} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700">← Back</button><button onClick={() => window.print()} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">Print / Save PDF</button></div>
      <section className="mx-auto max-w-5xl border border-slate-300 bg-white p-7 shadow-xl sm:p-12 print:min-h-screen print:border-0 print:shadow-none">
        <div className="border-[3px] border-slate-900 p-6 sm:p-12">
          <div className="text-center"><p className="text-sm font-black uppercase tracking-[0.3em] text-blue-600">Technerva Publications</p><p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Certificate of Publication</p><div className="mx-auto mt-6 h-px max-w-32 bg-slate-300" /><h1 className="mt-8 text-4xl font-black tracking-tight sm:text-6xl">Certificate of Achievement</h1><p className="mt-7 text-base text-slate-500">This certificate is proudly presented to</p><h2 className="mt-3 text-3xl font-black sm:text-5xl">{submission.name}</h2>{submission.college && <p className="mt-2 font-semibold text-slate-500">{submission.college}</p>}</div>
          <div className="mx-auto mt-10 max-w-3xl text-center"><p className="text-base leading-7 text-slate-600">for the successful submission and publication of the following work through Technerva Publications.</p><div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-6"><p className="text-xs font-black uppercase tracking-wider text-blue-600">{submission.category}</p><p className="mt-2 text-2xl font-black sm:text-3xl">{submission.title}</p></div></div>
          <div className="mt-12 grid gap-8 border-t border-slate-200 pt-8 sm:grid-cols-3 sm:items-end"><div><p className="text-xs font-black uppercase tracking-wider text-slate-400">Issued</p><p className="mt-1 font-bold">{date}</p></div><div className="text-center"><p className="text-xs font-black uppercase tracking-wider text-slate-400">Certificate ID</p><p className="mt-1 font-mono text-sm font-bold">{submission.certificate_id}</p></div><div className="text-right"><p className="text-sm font-black">Technerva Publications</p><p className="mt-1 text-xs text-slate-400">Engineering Ideas. Real Impact.</p></div></div>
        </div>
      </section>
    </main>
  );
}
