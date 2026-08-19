"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Profile = {
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
  title: string;
  content: string;
  category: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Load profile
      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

      if (profileError) {
        console.error(profileError);
      } else {
        setProfile(profileData);
      }

      // Load projects
      const { data: projectData, error: projectError } =
        await supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

      if (projectError) {
        console.error(projectError);
      } else {
        setProjects(projectData || []);
      }

      // Load articles
     const { data: postData, error: postError } =
  await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

if (postError) {
  console.error("POST ERROR:", postError);
} else {
  console.log("POSTS FOUND:", postData);
  setPosts(postData || []);
}

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-semibold text-slate-900">
          Loading your Studexa profile...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <h1 className="text-2xl font-extrabold text-slate-950">
            Studexa<span className="text-blue-600">.</span>
          </h1>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Log out
          </button>

        </div>
      </nav>

      {/* Dashboard */}
      <section className="mx-auto max-w-6xl px-6 py-12">

        <p className="text-sm font-bold tracking-wide text-blue-600">
          STUDENT DASHBOARD
        </p>

        <h2 className="mt-2 text-4xl font-extrabold text-slate-950">
          Welcome, {profile?.full_name} 👋
        </h2>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-3">

          <button
            onClick={() => router.push("/profile/edit")}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
          >
            Edit Profile
          </button>

          <button
            onClick={async () => {
              const {
                data: { user },
              } = await supabase.auth.getUser();

              if (user) {
                router.push(`/profile/${user.id}`);
              }
            }}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800 hover:bg-slate-50"
          >
            View Public Profile
          </button>

          <button
            onClick={() => router.push("/projects/new")}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800 hover:bg-slate-50"
          >
            + Add Project
          </button>

          <button
            onClick={() => router.push("/blog/new")}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800 hover:bg-slate-50"
          >
            + Write Article
          </button>

        </div>

        <p className="mt-3 text-slate-600">
          This is your Studexa professional space.
        </p>

        {/* Basic information */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">

          <InfoCard
            title="COLLEGE"
            value={profile?.college || "Not added"}
          />

          <InfoCard
            title="BRANCH"
            value={profile?.branch || "Not added"}
          />

          <InfoCard
            title="GRADUATION"
            value={
              profile?.graduation_year
                ? String(profile.graduation_year)
                : "Not added"
            }
          />

        </div>

        {/* Bio */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm font-bold text-slate-500">
            ABOUT ME
          </p>

          <p className="mt-3 leading-7 text-slate-800">
            {profile?.bio || "No bio added yet."}
          </p>

        </div>

        {/* Skills */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm font-bold text-slate-500">
            SKILLS
          </p>

          <div className="mt-4 flex flex-wrap gap-2">

            {profile?.skills && profile.skills.length > 0 ? (
              profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-slate-600">
                No skills added yet.
              </p>
            )}

          </div>

        </div>

        {/* Projects */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <p className="text-sm font-bold text-slate-500">
                PROJECTS
              </p>

              <h3 className="mt-1 text-2xl font-extrabold text-slate-950">
                Things you have built
              </h3>
            </div>

            <button
              onClick={() => router.push("/projects/new")}
              className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              + Add Project
            </button>

          </div>

          {projects.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center">

              <p className="font-semibold text-slate-800">
                No projects added yet.
              </p>

              <button
                onClick={() => router.push("/projects/new")}
                className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 font-bold text-white hover:bg-blue-700"
              >
                Add your first project
              </button>

            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2">

              {projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-slate-200 p-5"
                >

                  <h4 className="text-xl font-extrabold text-slate-950">
                    {project.title}
                  </h4>

                  {project.description && (
                    <p className="mt-3 leading-6 text-slate-600">
                      {project.description}
                    </p>
                  )}

                  {project.technologies &&
                    project.technologies.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.technologies.map((technology) => (
                          <span
                            key={technology}
                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
                          >
                            {technology}
                          </span>
                        ))}
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

        </div>

        {/* Articles */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <p className="text-sm font-bold text-slate-500">
                ARTICLES
              </p>

              <h3 className="mt-1 text-2xl font-extrabold text-slate-950">
                Your published articles
              </h3>
            </div>

            <button
              onClick={() => router.push("/blog/new")}
              className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              + Write Article
            </button>

          </div>

          {posts.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center">

              <p className="font-semibold text-slate-800">
                You haven't published any articles yet.
              </p>

              <button
                onClick={() => router.push("/blog/new")}
                className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 font-bold text-white hover:bg-blue-700"
              >
                Write your first article
              </button>

            </div>
          ) : (
            <div className="mt-6 space-y-4">

              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-xl border border-slate-200 p-5"
                >

                  <div className="flex flex-wrap items-center gap-3">

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {post.category || "Engineering"}
                    </span>

                    <span className="text-xs font-medium text-slate-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>

                  </div>

                  <h4 className="mt-3 text-xl font-extrabold text-slate-950">
                    {post.title}
                  </h4>

                  <p className="mt-3 line-clamp-3 leading-6 text-slate-600">
                    {post.content}
                  </p>

                  <button
                    onClick={() => router.push(`/blog/${post.id}`)}
                    className="mt-4 font-bold text-blue-600 hover:text-blue-700"
                  >
                    Read article →
                  </button>

                </article>
              ))}

            </div>
          )}

        </div>

        {/* Coming soon */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">

          <ComingSoon
            title="Achievements"
            description="Highlight your accomplishments."
          />

          <ComingSoon
            title="Internships"
            description="Show your professional experience."
          />

        </div>

      </section>
    </main>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <p className="text-sm font-bold text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-lg font-bold text-slate-950">
        {value}
      </p>

    </div>
  );
}

function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <h3 className="text-xl font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-slate-600">
        {description}
      </p>

      <span className="mt-5 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        Coming soon
      </span>

    </div>
  );
}
