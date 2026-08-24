"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Project = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  technologies: string[] | null;
  github_url: string | null;
  live_url: string | null;
  created_at: string;
};

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, user_id, title, description, technologies, github_url, live_url, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("PROJECTS ERROR:", error);
      setError(error.message);
    } else {
      setProjects(data || []);
    }

    setLoading(false);
  }

  async function handleAddProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Please enter a project title.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const technologyArray = technologies
      .split(",")
      .map((tech) => tech.trim())
      .filter(Boolean);

    const { error: insertError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        technologies: technologyArray,
        github_url: githubUrl.trim() || null,
        live_url: liveUrl.trim() || null,
      });

    if (insertError) {
      console.error("INSERT PROJECT ERROR:", insertError);
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setTitle("");
    setDescription("");
    setTechnologies("");
    setGithubUrl("");
    setLiveUrl("");
    setShowForm(false);

    await loadProjects();

    setSaving(false);
  }

  async function deleteProject(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE PROJECT ERROR:", error);
      setError(error.message);
      return;
    }

    setProjects((current) =>
      current.filter((project) => project.id !== id)
    );
  }

  return (
    <main className="min-h-screen bg-[#050b1f] text-white">

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-[#050b1f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/")}
            className="text-2xl font-extrabold tracking-tight"
          >
            Studexa<span className="text-blue-500">.</span>
          </button>

          <div className="flex items-center gap-3">

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/10"
            >
              Dashboard
            </button>

            <button
              onClick={() => router.push("/students")}
              className="hidden rounded-xl px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/5 md:block"
            >
              Students
            </button>

          </div>
        </div>
      </nav>

      {/* Main */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-16">

        {/* Header */}
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">

          <div className="max-w-3xl">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Your projects 🚀
            </div>

            <h1 className="text-5xl font-black tracking-tight md:text-6xl">
              Things you
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                build.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Showcase your projects, technical skills and the things
              you're proud of building.
            </p>

          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-2xl bg-blue-600 px-6 py-4 font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
          >
            {showForm ? "Close" : "+ Add Project"}
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
            {error}
          </div>
        )}

        {/* Add Project Form */}
        {showForm && (
          <form
            onSubmit={handleAddProject}
            className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl md:p-8"
          >

            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                New project
              </p>

              <h2 className="mt-2 text-2xl font-extrabold">
                Add something you built
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">

              {/* Title */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Project title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Student Management System"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you build? What problem does it solve?"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Technologies */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Technologies
                </label>

                <input
                  type="text"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  placeholder="React, Next.js, Supabase"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Separate technologies with commas.
                </p>
              </div>

              {/* GitHub */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  GitHub URL
                </label>

                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Live URL */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Live project URL
                </label>

                <input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://yourproject.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-8 w-full rounded-xl bg-blue-600 px-5 py-4 font-extrabold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving project..." : "Save Project →"}
            </button>

          </form>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.04] p-12 text-center">
            <p className="font-semibold text-slate-400">
              Loading your projects...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && projects.length === 0 && !showForm && (
          <div className="mt-12 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl">
              🚀
            </div>

            <h2 className="mt-6 text-2xl font-extrabold">
              No projects yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-400">
              Start showcasing your work. Add your first project
              and let other students see what you can build.
            </p>

            <button
              onClick={() => setShowForm(true)}
              className="mt-7 rounded-xl bg-blue-600 px-6 py-3 font-bold transition hover:bg-blue-500"
            >
              Add your first project →
            </button>

          </div>
        )}

        {/* Projects */}
        {!loading && projects.length > 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {projects.map((project) => (
              <article
                key={project.id}
                className="group flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.06]"
              >

                {/* Icon */}
                <div className="flex items-start justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl">
                    💻
                  </div>

                  <button
                    onClick={() => deleteProject(project.id)}
                    className="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    Delete
                  </button>

                </div>

                {/* Title */}
                <h2 className="mt-6 text-2xl font-extrabold text-white">
                  {project.title}
                </h2>

                {/* Description */}
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-400">
                  {project.description || "No description added."}
                </p>

                {/* Technologies */}
                {project.technologies &&
                  project.technologies.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">

                      {project.technologies.map((technology) => (
                        <span
                          key={technology}
                          className="rounded-full border border-blue-400/10 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300"
                        >
                          {technology}
                        </span>
                      ))}

                    </div>
                  )}

                {/* Links */}
                <div className="mt-7 flex gap-3">

                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-bold text-slate-200 transition hover:bg-white/10"
                    >
                      GitHub ↗
                    </a>
                  )}

                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-500"
                    >
                      Live Demo ↗
                    </a>
                  )}

                </div>

              </article>
            ))}

          </div>
        )}

      </section>
    </main>
  );
}