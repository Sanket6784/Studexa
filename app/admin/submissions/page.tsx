"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Submission = {
  id: string; user_id: string; name: string; college: string | null; email: string | null;
  category: string; title: string; content: string; work_url: string | null; status: string;
  reviewer_notes: string | null; post_id: string | null; certificate_id: string | null;
  certificate_issued_at: string | null; created_at: string;
};

export default function SubmissionAdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [items, setItems] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/login"); return; }
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
    if (!profile?.is_admin) { setAuthorized(false); return; }
    setAuthorized(true);
    const { data, error: queryError } = await supabase.from("publication_submissions").select("*").order("created_at", { ascending: false });
    if (queryError) setError(queryError.message); else setItems((data || []) as Submission[]);
  }

  async function updateSubmission(status: string) {
    if (!selected) return;
    setBusy(true); setError("");
    const payload: Record<string, unknown> = { status, reviewer_notes: notes.trim() || null };
    if (status === "approved" && !selected.certificate_id) {
      payload.certificate_id = `TECH-PUB-${selected.id.replace(/-/g, "").slice(0, 10).toUpperCase()}`;
      payload.certificate_issued_at = new Date().toISOString();
    }
    const { error: updateError } = await supabase.from("publication_submissions").update(payload).eq("id", selected.id);
    if (updateError) { setError(updateError.message); setBusy(false); return; }
    await load();
    const refreshed = { ...selected, ...payload } as Submission;
    setSelected(refreshed);
    setBusy(false);
  }

  async function publishSelected() {
    if (!selected) return;
    setBusy(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Admin session expired."); setBusy(false); return; }
    let postId = selected.post_id;
    if (!postId) {
      const { data: post, error: postError } = await supabase.from("posts").insert({ user_id: user.id, title: selected.title, content: selected.content, category: selected.category }).select("id").single();
      if (postError) { setError(postError.message); setBusy(false); return; }
      postId = post.id;
    }
    const { error: updateError } = await supabase.from("publication_submissions").update({ status: "approved", post_id: postId, reviewer_notes: notes.trim() || selected.reviewer_notes || null, certificate_id: selected.certificate_id || `TECH-PUB-${selected.id.replace(/-/g, "").slice(0, 10).toUpperCase()}`, certificate_issued_at: selected.certificate_issued_at || new Date().toISOString() }).eq("id", selected.id);
    if (updateError) { setError(updateError.message); setBusy(false); return; }
    await load();
    setSelected(null);
    setBusy(false);
  }

  if (authorized === null) return <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc]"><p className="font-bold text-slate-500">Checking admin access...</p></main>;
  if (!authorized) return <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] p-6"><div className="rounded-3xl border border-slate-200 bg-white p-10 text-center"><h1 className="text-3xl font-black">Admin access required</h1><button onClick={() => router.push("/")} className="mt-6 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white">Back home</button></div></main>;

  const visible = filter === "all" ? items : items.filter(item => item.status === filter);
  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <nav className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><button onClick={() => router.push("/dashboard")} className="text-xl font-black">Technerva</button><button onClick={() => router.push("/")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">View site</button></div></nav>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Technerva Publications</p><h1 className="mt-2 text-4xl font-black tracking-tight">Submission review</h1><p className="mt-2 text-slate-500">Review student work, publish approved submissions and issue certificates.</p></div><div className="flex flex-wrap gap-2">{["all","pending","under_review","approved","revision_requested","rejected"].map(value => <button key={value} onClick={() => setFilter(value)} className={`rounded-xl px-3 py-2 text-xs font-bold ${filter === value ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{value.replace("_", " ")}</button>)}</div></div>
        {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div>}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">{visible.map(item => <button key={item.id} onClick={() => { setSelected(item); setNotes(item.reviewer_notes || ""); }} className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-4"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{item.category}</span><span className="text-xs font-bold uppercase text-slate-400">{item.status.replace("_", " ")}</span></div><h2 className="mt-4 text-xl font-black">{item.title}</h2><p className="mt-2 text-sm font-semibold text-slate-600">{item.name}{item.college ? ` · ${item.college}` : ""}</p><p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">{item.content}</p><p className="mt-5 text-xs font-bold text-slate-400">{new Date(item.created_at).toLocaleString()}</p></button>)}{visible.length === 0 && <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 lg:col-span-2">No submissions in this status.</div>}</div>
      </section>

      {selected && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 sm:p-8"><div className="mx-auto max-w-4xl rounded-3xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 p-6"><div><p className="text-xs font-black uppercase tracking-wider text-blue-600">{selected.category}</p><h2 className="mt-1 text-2xl font-black">{selected.title}</h2><p className="mt-1 text-sm text-slate-500">{selected.name} · {selected.email || "No email"}</p></div><button onClick={() => setSelected(null)} className="rounded-xl border border-slate-200 px-3 py-2 font-bold">✕</button></div><div className="grid gap-6 p-6 lg:grid-cols-[1fr_280px]"><article className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-6 text-sm leading-7 text-slate-700">{selected.content}</article><aside><label className="text-sm font-bold text-slate-700">Reviewer notes<textarea value={notes} onChange={e => setNotes(e.target.value)} rows={6} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500" placeholder="Optional feedback for the student" /></label>{selected.work_url && <a href={selected.work_url} target="_blank" rel="noreferrer" className="mt-4 block text-sm font-bold text-blue-600">Open supporting link →</a>}<div className="mt-6 space-y-2"><button disabled={busy} onClick={() => updateSubmission("under_review")} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold">Mark under review</button><button disabled={busy} onClick={publishSelected} className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">Approve & publish + certificate</button><button disabled={busy} onClick={() => updateSubmission("revision_requested")} className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">Request revision</button><button disabled={busy} onClick={() => updateSubmission("rejected")} className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">Reject</button></div>{selected.certificate_id && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs font-black uppercase text-emerald-700">Certificate issued</p><p className="mt-1 font-mono text-sm font-bold text-slate-800">{selected.certificate_id}</p><button onClick={() => router.push(`/certificate/${selected.id}`)} className="mt-2 text-sm font-bold text-emerald-700">View certificate →</button></div>}</aside></div></div></div>}
    </main>
  );
}
