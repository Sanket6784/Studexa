"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Profile = {
  id: string;
  full_name: string;
  college: string | null;
  branch: string | null;
  graduation_year: number | null;
  bio: string | null;
  skills: string[] | null;
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  technologies: string[] | null;
  github_url: string | null;
  live_url: string | null;
};

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id || "");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!id) {
        setError("Invalid profile ID.");
        setLoading(false);
        return;
      }

      console.log("PROFILE PAGE ID:", id);

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, college, branch, graduation_year, bio, skills"
        )
        .eq("id", id)
        .maybeSingle();

      console.log("PROFILE DATA:", data);
      console.log("PROFILE ERROR:", profileError);

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("No profile found for this ID.");
        setLoading(false);
        return;
      }

      setProfile(data);

      const { data: projectData, error: projectError } =
        await supabase
          .from("projects")
          .select(
            "id, title, description, technologies, github_url, live_url"
          )
          .eq("user_id", id)
          .order("created_at", { ascending: false });

      if (projectError) {
        console.error("PROJECT ERROR:", projectError);
      } else {
        setProjects(projectData || []);
      }

      setLoading(false);
    }

    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="font-bold text-slate-900">
          Loading profile...
        </p>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

          <div className="text-5xl">👤</div>

          <h1 className="mt-4 text-2xl font-extrabold text-slate-950">
            Profile unavailable
          </h1>

          <p className="mt-3 text-slate-600">
            {error || "Student profile not found."}
          </p>

          <button
            onClick={() => router.push("/students")}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
          >
            Back to Students
          </button>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/")}
            className="text-2xl font-extrabold"
          >
            Studexa<span className="text-blue-600">.</span>
          </button>

          <div className="flex gap-3">

            <button
              onClick={() => router.push("/students")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold hover:bg-slate-50"
            >
              Students
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white hover:bg-slate-800"
            >
              Dashboard
            </button>

          </div>

        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-10">

        <div className="rounded-3xl bg-slate-950 p-8 md:p-10">

          <div className="flex flex-col gap-6 md:flex-row md:items-center">

            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-blue-600 text-4xl font-extrabold text-white">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="text-sm font-bold tracking-widest text-blue-400">
                STUDENT PROFILE
              </p>

              <h1 className="mt-2 text-4xl font-extrabold text-white">
                {profile.full_name}
              </h1>

              <p className="mt-3 text-lg text-slate-300">
                {profile.branch || "Student"}
                {profile.college && ` • ${profile.college}`}
              </p>

              {profile.graduation_year && (
                <p className="mt-2 text-slate-400">
                  Class of {profile.graduation_year}
                </p>
              )}
            </div>

          </div>

          {profile.bio && (
            <p className="mt-8 max-w-3xl leading-7 text-slate-300">
              {profile.bio}
            </p>
          )}

        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm font-bold tracking-widest text-blue-600">
            SKILLS
          </p>

          <div className="mt-4 flex flex-wrap gap-2">

            {(profile.skills || []).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"
              >
                {skill}
              </span>
            ))}

          </div>

        </div>

        <section className="mt-10">

          <p className="text-sm font-bold tracking-widest text-blue-600">
            PROJECTS
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            {profile.full_name.split(" ")[0]}'s projects
          </h2>

          {projects.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              No projects added yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2">

              {projects.map((project) => (
                <article
                  key={project.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >

                  <h3 className="text-xl font-extrabold">
                    {project.title}
                  </h3>

                  {project.description && (
                    <p className="mt-3 leading-7 text-slate-600">
                      {project.description}
                    </p>
                  )}

                  {project.technologies &&
                    project.technologies.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.technologies.map((technology) => (
                          <span
                            key={technology}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold"
                          >
                            {technology}
                          </span>
                        ))}
                      </div>
                    )}

                  <div className="mt-5 flex gap-3">

                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-slate-300 px-4 py-2 font-bold"
                      >
                        GitHub ↗
                      </a>
                    )}

                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white"
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

      </section>

    </main>
  );
}