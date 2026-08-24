"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Project = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  technologies: string[] | null;
  github_url: string | null;
  live_url: string | null;
};

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadProject() {
      if (!projectId) return;

      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error: projectError } = await supabase
        .from("projects")
        .select("id, user_id, title, description, technologies, github_url, live_url")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (projectError || !data) {
        console.error(projectError);
        setError("Project not found or you do not have access to it.");
        setLoading(false);
        return;
      }

      const project = data as Project;
      setTitle(project.title || "");
      setDescription(project.description || "");
      setTechnologies(project.technologies?.join(", ") || "");
      setGithubUrl(project.github_url || "");
      setLiveUrl(project.live_url || "");
      setLoading(false);
    }

    loadProject();
  }, [projectId, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setSaved(false);
    setError("");

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanGithub = githubUrl.trim();
    const cleanLive = liveUrl.trim();

    if (!cleanTitle) {
      setError("Please enter a project title.");
      setSaving(false);
      return;
    }

    if (!cleanDescription) {
      setError("Please enter a project description.");
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const technologyList = technologies
      .split(",")
      .map((technology) => technology.trim())
      .filter(Boolean);

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        title: cleanTitle,
        description: cleanDescription,
        technologies: technologyList,
        github_url: cleanGithub || null,
        live_url: cleanLive || null,
      })
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error(updateError);
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);

    setTimeout(() => {
      router.push("/projects");
      router.refresh();
    }, 500);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050b1f] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
          <p className="mt-5 font-bold text-slate-400">Loading your project...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b1f] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-150px] top-[-180px] h-[600px] w-[600px] rounded-full bg-blue-600/15 blur-[150px]" />
        <div className="absolute right-[-180px] top-[25%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute bottom-[-250px] left-[25%] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[140px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-[#050b1f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-6">
          <button
            onClick={() => router.push("/")}
            className="text-2xl font-black tracking-tight"
          >
            Studexa<span className="text-blue-500">.</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => router.push("/projects")}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              ← Projects
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="hidden rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 sm:block"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Page */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-10 sm:px-6 md:py-14">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-extrabold tracking-widest text-blue-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            PROJECT SETTINGS
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            Edit your
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              project.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
            Update the project details you want other students to see.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-xl sm:p-8 md:p-10"
        >
          <div className="flex items-center gap-4 border-b border-white/10 pb-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl">
              💻
            </div>
            <div>
              <p className="text-xs font-extrabold tracking-widest text-blue-400">
                PROJECT DETAILS
              </p>
              <h2 className="mt-1 text-xl font-black">Update your work</h2>
            </div>
          </div>

          {/* Title */}
          <div className="mt-8">
            <label htmlFor="title" className="mb-2 block text-sm font-bold text-slate-200">
              Project title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Student Management System"
              className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3.5 font-medium text-white outline-none placeholder:text-slate-600 transition focus:border-blue-400/40 focus:bg-white/[0.07] focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Description */}
          <div className="mt-6">
            <label htmlFor="description" className="mb-2 block text-sm font-bold text-slate-200">
              Description
            </label>
            <textarea
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you build? What problem does it solve?"
              rows={7}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3.5 leading-7 text-white outline-none placeholder:text-slate-600 transition focus:border-blue-400/40 focus:bg-white/[0.07] focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Technologies */}
          <div className="mt-6">
            <label htmlFor="technologies" className="mb-2 block text-sm font-bold text-slate-200">
              Technologies
            </label>
            <input
              id="technologies"
              type="text"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="React, Next.js, Supabase"
              className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3.5 font-medium text-white outline-none placeholder:text-slate-600 transition focus:border-blue-400/40 focus:bg-white/[0.07] focus:ring-4 focus:ring-blue-500/10"
            />
            <p className="mt-2 text-xs text-slate-500">Separate technologies with commas.</p>
          </div>

          {/* Links */}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="github" className="mb-2 block text-sm font-bold text-slate-200">
                GitHub URL
              </label>
              <input
                id="github"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3.5 font-medium text-white outline-none placeholder:text-slate-600 transition focus:border-blue-400/40 focus:bg-white/[0.07] focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label htmlFor="live" className="mb-2 block text-sm font-bold text-slate-200">
                Live project URL
              </label>
              <input
                id="live"
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://yourproject.com"
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3.5 font-medium text-white outline-none placeholder:text-slate-600 transition focus:border-blue-400/40 focus:bg-white/[0.07] focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="mt-7 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-semibold leading-6 text-red-300">
              {error}
            </div>
          )}

          {saved && (
            <div className="mt-7 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-300">
              Project updated successfully. Returning to projects...
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving || saved}
              className="flex-1 rounded-xl bg-blue-600 px-6 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving changes..." : saved ? "Saved ✓" : "Save Changes →"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/projects")}
              disabled={saving}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-4 font-bold text-slate-200 transition hover:bg-white/[0.08] disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs font-medium text-slate-600">
          Your project will remain visible on your Studexa profile.
        </p>
      </section>
    </main>
  );
}
