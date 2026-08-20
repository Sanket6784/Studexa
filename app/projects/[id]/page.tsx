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

  useEffect(() => {
    async function loadProject() {
      if (!projectId) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        console.error(error);
        setError("Project not found.");
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
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setSaving(false);
      return;
    }

    const technologyList = technologies
      .split(",")
      .map((technology) => technology.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from("projects")
      .update({
        title,
        description,
        technologies: technologyList,
        github_url: githubUrl || null,
        live_url: liveUrl || null,
      })
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/projects");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-bold text-slate-900">
          Loading project...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/projects")}
            className="text-2xl font-extrabold text-slate-950"
          >
            Studexa<span className="text-blue-600">.</span>
          </button>

          <button
            onClick={() => router.push("/projects")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            Back to projects
          </button>

        </div>
      </nav>

      {/* Page */}
      <section className="mx-auto max-w-3xl px-6 py-12">

        {/* Header */}
        <div className="text-center">

          <p className="text-sm font-bold tracking-widest text-blue-600">
            YOUR PROJECT
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-slate-950">
            Edit project
          </h1>

          <p className="mt-3 text-slate-600">
            Update your project information.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Project title
            </label>

            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="For example: Student Management System"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Description */}
          <div className="mt-6">

            <label
              htmlFor="description"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Description
            </label>

            <textarea
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what the project does and what you built..."
              rows={6}
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Technologies */}
          <div className="mt-6">

            <label
              htmlFor="technologies"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Technologies
            </label>

            <input
              id="technologies"
              type="text"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="Next.js, React, TypeScript, Supabase"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-xs font-medium text-slate-500">
              Separate technologies with commas.
            </p>

          </div>

          {/* GitHub */}
          <div className="mt-6">

            <label
              htmlFor="github"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              GitHub URL
            </label>

            <input
              id="github"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/yourusername/project"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Live Demo */}
          <div className="mt-6">

            <label
              htmlFor="live"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Live demo URL
            </label>

            <input
              id="live"
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://yourproject.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving changes..." : "Save Changes →"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/projects")}
              className="rounded-xl border border-slate-300 bg-white px-6 py-4 text-base font-bold text-slate-800 hover:bg-slate-50"
            >
              Cancel
            </button>

          </div>

        </form>

      </section>
    </main>
  );
}