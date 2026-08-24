"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
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

type Article = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  created_at: string;
};

type Student = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  college: string | null;
  branch: string | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    setUserId(user.id);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, full_name, avatar_url, college, branch, graduation_year, bio, skills"
      )
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("PROFILE ERROR:", profileError);
      setError("Could not load your profile.");
    }

    setProfile(profileData || null);

    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("id, title, description, technologies")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4);

    if (projectError) {
      console.error("PROJECT ERROR:", projectError);
    }

    setProjects(projectData || []);

    const { data: articleData, error: articleError } = await supabase
      .from("posts")
      .select("id, title, content, category, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    if (articleError) {
      console.error("ARTICLE ERROR:", articleError);
    }

    setArticles(articleData || []);

    const { data: studentData, error: studentError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, college, branch")
      .neq("id", user.id)
      .order("full_name", { ascending: true })
      .limit(6);

    if (studentError) {
      console.error("STUDENT ERROR:", studentError);
    }

    setStudents(studentData || []);

    setLoading(false);
  }

  async function logout() {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error);
      setLoggingOut(false);
      return;
    }

    router.replace("/login");
  }

  const profileCompletion = useMemo(() => {
    if (!profile) return 0;

    const fields = [
      profile.full_name,
      profile.avatar_url,
      profile.college,
      profile.branch,
      profile.graduation_year,
      profile.bio,
      profile.skills && profile.skills.length > 0,
    ];

    const completed = fields.filter(Boolean).length;

    return Math.round((completed / fields.length) * 100);
  }, [profile]);

  const firstName =
    profile?.full_name?.trim().split(" ")[0] || "Student";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050b1f] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />

          <p className="mt-5 font-bold text-slate-400">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050b1f] text-white">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-200px] top-[-150px] h-[600px] w-[600px] rounded-full bg-blue-600/15 blur-[150px]" />

        <div className="absolute right-[-200px] top-[20%] h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[150px]" />

        <div className="absolute bottom-[-250px] left-[30%] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[150px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-[#050b1f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5">

          <button
            onClick={() => router.push("/dashboard")}
            className="text-2xl font-black tracking-tight"
          >
            Studexa<span className="text-blue-500">.</span>
          </button>

          <div className="flex items-center gap-2">

            <button
              onClick={() => router.push(`/profile/${userId}`)}
              className="hidden rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white sm:block"
            >
              My Profile
            </button>

            <button
              onClick={logout}
              disabled={loggingOut}
              className="rounded-xl border border-red-400/10 bg-red-500/5 px-3 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50 sm:px-4"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>

          </div>

        </div>
      </nav>

      {/* Content */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-6 md:py-12">

        {/* Welcome */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

          <div>
            <p className="text-sm font-bold tracking-widest text-blue-400">
              STUDEXA DASHBOARD
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
              Welcome, {firstName}.
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Manage your student profile, projects and community activity
              from one place.
            </p>
          </div>

          <button
            onClick={() => router.push(`/profile/${userId}`)}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-500 md:w-auto"
          >
            View My Profile →
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 font-semibold text-red-300">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <button
            onClick={() => router.push(`/profile/${userId}`)}
            className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-left backdrop-blur-xl transition hover:border-blue-400/20 hover:bg-white/[0.06]"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Profile
            </p>

            <p className="mt-2 text-3xl font-black text-blue-400">
              {profileCompletion}%
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Complete
            </p>
          </button>

          <button
            onClick={() => router.push(`/profile/${userId}`)}
            className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-left backdrop-blur-xl transition hover:border-blue-400/20 hover:bg-white/[0.06]"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Projects
            </p>

            <p className="mt-2 text-3xl font-black">
              {projects.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Your projects
            </p>
          </button>

          <button
            onClick={() => router.push("/community")}
            className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-left backdrop-blur-xl transition hover:border-blue-400/20 hover:bg-white/[0.06]"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Articles
            </p>

            <p className="mt-2 text-3xl font-black">
              {articles.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Published
            </p>
          </button>

          <button
            onClick={() => router.push("/students")}
            className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-left backdrop-blur-xl transition hover:border-blue-400/20 hover:bg-white/[0.06]"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Network
            </p>

            <p className="mt-2 text-3xl font-black">
              {students.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Students shown
            </p>
          </button>

        </div>

        {/* Quick Actions */}
        <div className="mt-8">

          <div className="mb-4">
            <p className="text-xs font-extrabold tracking-widest text-blue-400">
              QUICK ACTIONS
            </p>

            <h2 className="mt-1 text-2xl font-black">
              What do you want to do?
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <button
              onClick={() => router.push(`/profile/${userId}`)}
              className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-left transition hover:-translate-y-1 hover:border-blue-400/20 hover:bg-white/[0.07]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
                👤
              </div>

              <h3 className="mt-4 font-black">
                My Profile
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                View and manage your student identity.
              </p>

              <p className="mt-4 text-sm font-bold text-blue-400 group-hover:text-blue-300">
                Open profile →
              </p>
            </button>

            <button
              onClick={() => router.push("/students")}
              className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-left transition hover:-translate-y-1 hover:border-blue-400/20 hover:bg-white/[0.07]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-xl">
                👥
              </div>

              <h3 className="mt-4 font-black">
                Discover Students
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Explore students and their profiles.
              </p>

              <p className="mt-4 text-sm font-bold text-blue-400 group-hover:text-blue-300">
                Browse students →
              </p>
            </button>

            <button
              onClick={() => router.push("/community")}
              className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-left transition hover:-translate-y-1 hover:border-blue-400/20 hover:bg-white/[0.07]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-xl">
                📝
              </div>

              <h3 className="mt-4 font-black">
                Community
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Read and share student knowledge.
              </p>

              <p className="mt-4 text-sm font-bold text-blue-400 group-hover:text-blue-300">
                Open community →
              </p>
            </button>

            <button
              onClick={() => router.push("/community/new")}
              className="group rounded-2xl border border-blue-500/20 bg-blue-500/[0.08] p-5 text-left transition hover:-translate-y-1 hover:bg-blue-500/[0.12]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
                ✍️
              </div>

              <h3 className="mt-4 font-black">
                Write Article
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Share what you have learned.
              </p>

              <p className="mt-4 text-sm font-bold text-blue-400 group-hover:text-blue-300">
                Start writing →
              </p>
            </button>

          </div>
        </div>

        {/* Main Grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* Recent Projects */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl backdrop-blur-xl lg:col-span-2 sm:p-8">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-extrabold tracking-widest text-blue-400">
                  YOUR WORK
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Recent projects
                </h2>
              </div>

              <button
                onClick={() => router.push(`/profile/${userId}`)}
                className="text-sm font-bold text-blue-400 hover:text-blue-300"
              >
                View all →
              </button>

            </div>

            {projects.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">

                <div className="text-3xl">🚀</div>

                <p className="mt-3 font-bold text-slate-400">
                  You haven't added any projects yet.
                </p>

                <button
                  onClick={() => router.push("/profile/edit")}
                  className="mt-4 text-sm font-bold text-blue-400 hover:text-blue-300"
                >
                  Add your first project →
                </button>

              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                  >
                    <h3 className="font-black">
                      {project.title}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                      {project.description || "No description added."}
                    </p>

                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {project.technologies.slice(0, 4).map((technology) => (
                            <span
                              key={technology}
                              className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-300"
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

          {/* Profile Progress */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl backdrop-blur-xl sm:p-8">

            <p className="text-xs font-extrabold tracking-widest text-blue-400">
              YOUR PROFILE
            </p>

            <h2 className="mt-1 text-2xl font-black">
              Profile strength
            </h2>

            <div className="mt-7 flex items-center justify-center">

              <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[10px] border-white/10">

                <div
                  className="absolute inset-[-10px] rounded-full border-[10px] border-blue-500"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                    opacity: profileCompletion > 0 ? 1 : 0,
                  }}
                />

                <div className="text-center">
                  <p className="text-4xl font-black text-blue-400">
                    {profileCompletion}%
                  </p>

                  <p className="text-xs font-bold text-slate-500">
                    complete
                  </p>
                </div>

              </div>

            </div>

            <div className="mt-7">

              {profileCompletion >= 100 ? (
                <div className="rounded-2xl bg-emerald-500/10 p-4">
                  <p className="font-bold text-emerald-400">
                    ✓ Profile complete
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Your profile is ready to represent you.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-blue-500/10 p-4">
                  <p className="font-bold text-blue-400">
                    Keep improving your profile
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Add missing information to make your profile stronger.
                  </p>

                  <button
                    onClick={() => router.push("/profile/edit")}
                    className="mt-3 text-sm font-bold text-blue-400 hover:text-blue-300"
                  >
                    Edit profile →
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* Articles */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl backdrop-blur-xl sm:p-8">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-extrabold tracking-widest text-blue-400">
                COMMUNITY
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Your recent articles
              </h2>
            </div>

            <button
              onClick={() => router.push("/community")}
              className="text-sm font-bold text-blue-400 hover:text-blue-300"
            >
              Community →
            </button>

          </div>

          {articles.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">

              <div className="text-3xl">📝</div>

              <p className="mt-3 font-bold text-slate-400">
                You haven't published an article yet.
              </p>

              <button
                onClick={() => router.push("/community/new")}
                className="mt-4 text-sm font-bold text-blue-400 hover:text-blue-300"
              >
                Write your first article →
              </button>

            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-3">

              {articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => router.push(`/community/${article.id}`)}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-left transition hover:border-blue-400/20 hover:bg-white/[0.05]"
                >

                  <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-300">
                    {article.category || "Engineering"}
                  </span>

                  <h3 className="mt-4 line-clamp-2 font-black">
                    {article.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                    {article.content}
                  </p>

                  <p className="mt-4 text-xs font-bold text-slate-600">
                    {new Date(article.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                </button>
              ))}

            </div>
          )}

        </div>

        {/* Students */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl backdrop-blur-xl sm:p-8">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-extrabold tracking-widest text-blue-400">
                NETWORK
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Discover students
              </h2>
            </div>

            <button
              onClick={() => router.push("/students")}
              className="text-sm font-bold text-blue-400 hover:text-blue-300"
            >
              View all →
            </button>

          </div>

          {students.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <p className="text-slate-500">
                No other students found yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => router.push(`/profile/${student.id}`)}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left transition hover:border-blue-400/20 hover:bg-white/[0.05]"
                >

                  {student.avatar_url ? (
                    <img
                      src={student.avatar_url}
                      alt={student.full_name || "Student"}
                      className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 font-black text-blue-400">
                      {student.full_name?.charAt(0).toUpperCase() || "S"}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-black text-white">
                      {student.full_name || "Studexa Student"}
                    </p>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {student.branch ||
                        student.college ||
                        "Student"}
                    </p>
                  </div>

                </button>
              ))}

            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="mt-8 flex flex-col gap-3 pb-8 sm:flex-row">

          <button
            onClick={() => router.push("/students")}
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            👥 Students
          </button>

          <button
            onClick={() => router.push("/community")}
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            📝 Community
          </button>

          <button
            onClick={() => router.push(`/profile/${userId}`)}
            className="flex-1 rounded-xl bg-blue-600 px-5 py-3.5 font-bold text-white transition hover:bg-blue-500"
          >
            👤 My Profile
          </button>

        </div>

      </section>
    </main>
  );
}