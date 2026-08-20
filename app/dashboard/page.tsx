"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

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
};

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
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

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(profileError);
      } else {
        setProfile(profileData);
      }

      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (projectError) {
        console.error(projectError);
      } else {
        setProjects(projectData || []);
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-bold text-slate-900">
          Loading dashboard...
        </p>
      </main>
    );
  }

  const firstName = profile?.full_name
    ? profile.full_name.split(" ")[0]
    : "Student";

  const profileFields = [
    profile?.full_name,
    profile?.college,
    profile?.branch,
    profile?.graduation_year,
    profile?.bio,
    profile?.skills && profile.skills.length > 0,
  ];

  const completedFields = profileFields.filter(Boolean).length;

  const completionPercentage = Math.round(
    (completedFields / profileFields.length) * 100
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/dashboard")}
            className="text-2xl font-extrabold text-slate-950"
          >
            Studexa<span className="text-blue-600">.</span>
          </button>

          <div className="flex items-center gap-3">

            {profile?.id && (
              <button
                onClick={() => router.push(`/profile/${profile.id}`)}
                className="hidden rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 sm:block"
              >
                View Profile
              </button>
            )}

            <button
              onClick={() => router.push("/students")}
              className="hidden rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 sm:block"
            >
              Students
            </button>

            <button
              onClick={() => router.push("/articles")}
              className="hidden rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 md:block"
            >
              Articles
            </button>

            <button
              onClick={() => router.push("/community")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              Community
            </button>

            <button
              onClick={handleLogout}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
            >
              Log out
            </button>

          </div>
        </div>
      </nav>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Welcome */}
        <div>
          <p className="text-sm font-bold tracking-widest text-blue-600">
            DASHBOARD
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-slate-950">
            Welcome back, {firstName} 👋
          </h1>

          <p className="mt-3 text-lg text-slate-600">
            Build your student identity and showcase what you can do.
          </p>
        </div>

        {/* Profile Completion */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <p className="text-sm font-bold text-slate-500">
                PROFILE COMPLETION
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-slate-950">
                {completionPercentage}% complete
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Keep building your profile to make it stronger.
              </p>
            </div>

            <button
              onClick={() => router.push("/profile/setup")}
              className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
            >
              Edit Profile
            </button>

          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

        </div>

        {/* Quick Actions */}
        <div className="mt-8">

          <p className="text-sm font-bold tracking-widest text-blue-600">
            QUICK ACTIONS
          </p>

          <div className="mt-4 grid gap-5 md:grid-cols-4">

            {/* Profile */}
            <button
              onClick={() =>
                profile?.id && router.push(`/profile/${profile.id}`)
              }
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-3xl">👤</div>

              <h2 className="mt-4 text-xl font-extrabold text-slate-950">
                My Profile
              </h2>

              <p className="mt-2 text-slate-600">
                View your public Studexa profile.
              </p>

              <p className="mt-4 font-bold text-blue-600">
                View profile →
              </p>
            </button>

            {/* Projects */}
            <button
              onClick={() => router.push("/projects")}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-3xl">💻</div>

              <h2 className="mt-4 text-xl font-extrabold text-slate-950">
                My Projects
              </h2>

              <p className="mt-2 text-slate-600">
                Showcase the projects you have built.
              </p>

              <p className="mt-4 font-bold text-blue-600">
                Manage projects →
              </p>
            </button>

            {/* Articles */}
            <button
              onClick={() => router.push("/articles")}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-3xl">📝</div>

              <h2 className="mt-4 text-xl font-extrabold text-slate-950">
                Articles
              </h2>

              <p className="mt-2 text-slate-600">
                Read and publish articles from students.
              </p>

              <p className="mt-4 font-bold text-blue-600">
                Explore articles →
              </p>
            </button>

            {/* Community */}
            <button
              onClick={() => router.push("/community")}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-3xl">🌐</div>

              <h2 className="mt-4 text-xl font-extrabold text-slate-950">
                Community
              </h2>

              <p className="mt-2 text-slate-600">
                Read, like and discuss student content.
              </p>

              <p className="mt-4 font-bold text-blue-600">
                Explore community →
              </p>
            </button>

          </div>
        </div>

        {/* Profile Summary */}
        {profile && (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

              <div>
                <p className="text-sm font-bold tracking-widest text-blue-600">
                  YOUR PROFILE
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                  {profile.full_name}
                </h2>

                <p className="mt-2 text-slate-600">
                  {profile.branch || "Student"}
                  {profile.college && ` • ${profile.college}`}
                </p>

                {profile.graduation_year && (
                  <p className="mt-1 text-sm text-slate-500">
                    Class of {profile.graduation_year}
                  </p>
                )}
              </div>

              <button
                onClick={() => router.push("/profile/setup")}
                className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-800 hover:bg-slate-50"
              >
                Edit
              </button>

            </div>

            {profile.bio && (
              <p className="mt-5 max-w-3xl leading-7 text-slate-600">
                {profile.bio}
              </p>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

          </div>
        )}

        {/* Recent Projects */}
        <div className="mt-10">

          <div className="flex items-end justify-between">

            <div>
              <p className="text-sm font-bold tracking-widest text-blue-600">
                PROJECTS
              </p>

              <h2 className="mt-1 text-3xl font-extrabold text-slate-950">
                Your recent projects
              </h2>
            </div>

            <button
              onClick={() => router.push("/projects")}
              className="font-bold text-blue-600 hover:text-blue-700"
            >
              View all →
            </button>

          </div>

          {projects.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

              <div className="text-4xl">💻</div>

              <h3 className="mt-4 text-xl font-extrabold text-slate-950">
                No projects yet
              </h3>

              <p className="mt-2 text-slate-600">
                Add your first project and start building your portfolio.
              </p>

              <button
                onClick={() => router.push("/projects/new")}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
              >
                Add Project →
              </button>

            </div>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-3">

              {projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >

                  <h3 className="text-xl font-extrabold text-slate-950">
                    {project.title}
                  </h3>

                  {project.description && (
                    <p className="mt-3 line-clamp-3 leading-6 text-slate-600">
                      {project.description}
                    </p>
                  )}

                  {project.technologies &&
                    project.technologies.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">

                        {project.technologies.map((technology) => (
                          <span
                            key={technology}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
                          >
                            {technology}
                          </span>
                        ))}

                      </div>
                    )}

                </div>
              ))}

            </div>
          )}

        </div>

        {/* Articles CTA */}
        <div className="mt-10 rounded-3xl bg-slate-950 px-8 py-12 text-center">

          <p className="text-sm font-bold tracking-widest text-blue-400">
            STUDENT ARTICLES
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-white">
            Share what you learn.
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Write about what you build, learn and experience,
            and share it with the Studexa community.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">

            <button
              onClick={() => router.push("/articles/new")}
              className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
            >
              Write an Article →
            </button>

            <button
              onClick={() => router.push("/articles")}
              className="rounded-xl border border-slate-600 px-6 py-3 font-bold text-white hover:bg-slate-800"
            >
              Read Articles
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}