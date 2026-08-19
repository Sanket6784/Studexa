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

type Post = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string | null;
  created_at: string;
};

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!id) return;

      // Profile
      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError || !profileData) {
        console.error(profileError);
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Projects
      const {
        data: projectData,
        error: projectError,
      } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      if (projectError) {
        console.error("PROJECT ERROR:", projectError);
      } else {
        setProjects(projectData || []);
      }

      // Articles
      const {
        data: postData,
        error: postError,
      } = await supabase
        .from("posts")
        .select(
          "id, user_id, title, content, category, created_at"
        )
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      if (postError) {
        console.error("POST ERROR:", postError);
      } else {
        setPosts(postData || []);
      }

      setLoading(false);
    }

    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-semibold text-slate-900">
          Loading profile...
        </p>
      </main>
    );
  }

  if (notFound || !profile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">

        <div className="text-5xl">👤</div>

        <h1 className="mt-5 text-4xl font-extrabold text-slate-950">
          Profile not found
        </h1>

        <p className="mt-3 text-slate-600">
          This student profile does not exist.
        </p>

        <button
          onClick={() => router.push("/students")}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
        >
          Discover Students
        </button>

      </main>
    );
  }

  const firstName =
    profile.full_name.split(" ")[0] || profile.full_name;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/")}
            className="text-2xl font-extrabold text-slate-950"
          >
            Studexa<span className="text-blue-600">.</span>
          </button>

          <div className="flex items-center gap-3">

            <button
              onClick={() => router.push("/students")}
              className="hidden rounded-lg px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 md:block"
            >
              Students
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              Dashboard
            </button>

          </div>

        </div>
      </nav>

      {/* Profile */}
      <section className="mx-auto max-w-6xl px-6 py-10">

        {/* Hero Profile */}
        <div className="rounded-3xl bg-slate-950 p-8 md:p-10">

          <div className="flex flex-col gap-7 md:flex-row md:items-center">

            {/* Avatar */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-blue-600 text-4xl font-extrabold text-white">
              {profile.full_name
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>

              <p className="text-sm font-bold tracking-widest text-blue-400">
                STUDENT PROFILE
              </p>

              <h1 className="mt-2 text-4xl font-extrabold text-white md:text-5xl">
                {profile.full_name}
              </h1>

              <p className="mt-3 text-lg font-semibold text-slate-300">
                {profile.branch || "Student"}

                {profile.college &&
                  ` • ${profile.college}`}
              </p>

              {profile.graduation_year && (
                <p className="mt-2 text-slate-400">
                  Class of {profile.graduation_year}
                </p>
              )}

            </div>

          </div>

          {profile.bio && (
            <div className="mt-8 max-w-3xl">

              <p className="text-sm font-bold tracking-wide text-slate-400">
                ABOUT
              </p>

              <p className="mt-2 leading-7 text-slate-300">
                {profile.bio}
              </p>

            </div>
          )}

        </div>

        {/* Education */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm font-bold tracking-widest text-blue-600">
            EDUCATION
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
            {profile.college || "College not added"}
          </h2>

          <p className="mt-2 text-slate-600">
            {profile.branch || "Branch not added"}

            {profile.graduation_year &&
              ` • Graduation ${profile.graduation_year}`}
          </p>

        </div>

        {/* Skills */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm font-bold tracking-widest text-blue-600">
            SKILLS
          </p>

          {profile.skills &&
          profile.skills.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">

              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"
                >
                  {skill}
                </span>
              ))}

            </div>
          ) : (
            <p className="mt-3 text-slate-600">
              No skills added yet.
            </p>
          )}

        </div>

        {/* Projects */}
        <section className="mt-10">

          <div className="mb-5">

            <p className="text-sm font-bold tracking-widest text-blue-600">
              PROJECTS
            </p>

            <h2 className="mt-1 text-3xl font-extrabold text-slate-950">
              What {firstName} has built
            </h2>

          </div>

          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

              <div className="text-3xl">💻</div>

              <p className="mt-3 font-semibold text-slate-800">
                No projects added yet.
              </p>

            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">

              {projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >

                  <h3 className="text-xl font-extrabold text-slate-950">
                    {project.title}
                  </h3>

                  {project.description && (
                    <p className="mt-3 leading-6 text-slate-600">
                      {project.description}
                    </p>
                  )}

                  {project.technologies &&
                    project.technologies.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">

                        {project.technologies.map(
                          (technology) => (
                            <span
                              key={technology}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
                            >
                              {technology}
                            </span>
                          )
                        )}

                      </div>
                    )}

                  <div className="mt-5 flex flex-wrap gap-3">

                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
                      >
                        GitHub ↗
                      </a>
                    )}

                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                      >
                        Live Demo ↗
                      </a>
                    )}

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* Articles */}
        <section className="mt-10">

          <div className="mb-5">

            <p className="text-sm font-bold tracking-widest text-blue-600">
              ARTICLES
            </p>

            <h2 className="mt-1 text-3xl font-extrabold text-slate-950">
              What {firstName} has shared
            </h2>

          </div>

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

              <div className="text-3xl">📝</div>

              <p className="mt-3 font-semibold text-slate-800">
                No articles published yet.
              </p>

            </div>
          ) : (
            <div className="space-y-5">

              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >

                  <div className="flex flex-wrap items-center gap-3">

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {post.category || "Article"}
                    </span>

                    <span className="text-xs font-medium text-slate-500">
                      {new Date(
                        post.created_at
                      ).toLocaleDateString()}
                    </span>

                  </div>

                  <h3 className="mt-3 text-2xl font-extrabold text-slate-950">
                    {post.title}
                  </h3>

                  <p className="mt-3 line-clamp-4 leading-7 text-slate-600">
                    {post.content}
                  </p>

                  <button
                    onClick={() =>
                      router.push(`/blog/${post.id}`)
                    }
                    className="mt-5 font-bold text-blue-600 hover:text-blue-700"
                  >
                    Read article →
                  </button>

                </article>
              ))}

            </div>
          )}

        </section>

      </section>

    </main>
  );
}