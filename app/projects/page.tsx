"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Project = {
  id: string;
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
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
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("Could not load your projects.");
      } else {
        setProjects(data || []);
      }

      setLoading(false);
    }

    loadProjects();
  }, [router]);

  async function deleteProject(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setError("Could not delete the project.");
      setDeletingId(null);
      return;
    }

    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== id)
    );

    setDeletingId(null);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-bold text-slate-900">
          Loading projects...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/dashboard")}
            className="text-2xl font-extrabold text-slate-950"
          >
            Studexa<span className="text-blue-600">.</span>
          </button>

          <div className="flex gap-3">

            <button
              onClick={() => router.push("/community")}
              className="hidden rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 sm:block"
            >
              Community
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              Dashboard
            </button>

          </div>

        </div>
      </nav>

      {/* Page */}
      <section className="mx-auto max-w-6xl px-6 py-12">

        {/* Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

          <div>
            <p className="text-sm font-bold tracking-widest text-blue-600">
              YOUR WORK
            </p>

            <h1 className="mt-2 text-4xl font-extrabold text-slate-950 md:text-5xl">
              My Projects
            </h1>

            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              Showcase the things you have built and the technologies you
              have worked with.
            </p>

            <p className="mt-4 text-sm font-bold text-slate-500">
              {projects.length}{" "}
              {projects.length === 1 ? "project" : "projects"}
            </p>
          </div>

          <button
            onClick={() => router.push("/projects/new")}
            className="rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Add Project
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Empty State */}
        {projects.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

            <div className="text-5xl">
              💻
            </div>

            <h2 className="mt-5 text-2xl font-extrabold text-slate-950">
              No projects yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-600">
              Add your first project and start building your professional
              student portfolio.
            </p>

            <button
              onClick={() => router.push("/projects/new")}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
            >
              Add Your First Project →
            </button>

          </div>
        ) : (
          /* Projects */
          <div className="mt-10 grid gap-6 md:grid-cols-2">

            {projects.map((project) => (
              <article
                key={project.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >

                {/* Project Header */}
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-xs font-bold tracking-widest text-blue-600">
                      PROJECT
                    </p>

                    <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                      {project.title}
                    </h2>
                  </div>

                  <div className="rounded-xl bg-blue-50 px-3 py-2 text-xl">
                    💻
                  </div>

                </div>

                {/* Description */}
                {project.description && (
                  <p className="mt-5 leading-7 text-slate-600">
                    {project.description}
                  </p>
                )}

                {/* Technologies */}
                {project.technologies &&
                  project.technologies.length > 0 && (
                    <div className="mt-6">

                      <p className="text-xs font-bold tracking-widest text-slate-500">
                        TECHNOLOGIES
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">

                        {project.technologies.map((technology) => (
                          <span
                            key={technology}
                            className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700"
                          >
                            {technology}
                          </span>
                        ))}

                      </div>

                    </div>
                  )}

                {/* Links */}
                {(project.github_url || project.live_url) && (
                  <div className="mt-7 flex flex-wrap gap-3">

                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800 transition hover:bg-slate-50"
                      >
                        GitHub ↗
                      </a>
                    )}

                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700"
                      >
                        Live Demo ↗
                      </a>
                    )}

                  </div>
                )}

                {/* Delete */}
                <div className="mt-auto pt-7">

                  <button
                    onClick={() => deleteProject(project.id)}
                    disabled={deletingId === project.id}
                    className="text-sm font-bold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === project.id
                      ? "Deleting..."
                      : "Delete project"}
                  </button>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>
    </main>
  );
}