"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Profile = {
  id: string;
  full_name: string;
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
  github_url: string | null;
  live_url: string | null;
};

type Article = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadProfile();
  }, [id]);

  async function loadProfile() {
    setLoading(true);
    setNotFound(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setCurrentUserId(user.id);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, full_name, avatar_url, college, branch, graduation_year, bio, skills"
      )
      .eq("id", id)
      .maybeSingle();

    if (profileError) {
      console.error("PROFILE ERROR:", profileError);
      setLoading(false);
      return;
    }

    if (!profileData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setProfile(profileData);

    const [{ data: projectData, error: projectError }, { data: articleData, error: articleError }] =
      await Promise.all([
        supabase
          .from("projects")
          .select(
            "id, title, description, technologies, github_url, live_url"
          )
          .eq("user_id", id)
          .order("created_at", { ascending: false }),
        supabase
          .from("posts")
          .select("id, title, content, category, created_at")
          .eq("user_id", id)
          .order("created_at", { ascending: false }),
      ]);

    if (projectError) {
      console.error("PROJECT ERROR:", projectError);
    } else {
      setProjects(projectData || []);
    }

    if (articleError) {
      console.error("ARTICLE ERROR:", articleError);
    } else {
      setArticles(articleData || []);
    }

    setLoading(false);
  }

  const isOwnProfile = currentUserId === profile?.id;

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

    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [profile]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050b1f] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
          <p className="mt-5 font-semibold text-slate-400">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (notFound || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050b1f] px-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center shadow-2xl">
          <div className="text-5xl">👤</div>
          <h1 className="mt-6 text-3xl font-black">Profile not found</h1>
          <p className="mt-3 leading-7 text-slate-400">
            This student profile doesn't exist or is no longer available.
          </p>
          <button
            onClick={() => router.push("/students")}
            className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-bold text-white transition hover:bg-blue-500"
          >
            Back to Students
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050b1f] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-200px] top-[-150px] h-[600px] w-[600px] rounded-full bg-blue-600/15 blur-[150px]" />
        <div className="absolute right-[-200px] top-[20%] h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[150px]" />
        <div className="absolute bottom-[-250px] left-[30%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <nav className="relative z-10 border-b border-white/10 bg-[#050b1f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-5 sm:px-6">
          <button
            onClick={() => router.push("/")}
            className="text-2xl font-black tracking-tight"
          >
            Studexa<span className="text-blue-500">.</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => router.push("/students")}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white sm:px-4"
            >
              ← Students
            </button>

            {isOwnProfile && (
              <button
                onClick={() => router.push("/profile/edit")}
                className="rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 sm:px-4"
              >
                Edit Profile
              </button>
            )}

            <button
              onClick={() => router.push("/dashboard")}
              className="hidden rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white sm:block"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:px-6 md:py-14">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-2xl backdrop-blur-xl">
          <div className="relative h-32 overflow-hidden bg-gradient-to-r from-blue-600/30 via-blue-500/10 to-cyan-400/20 sm:h-48">
            <div className="absolute -right-20 -top-32 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -left-20 bottom-[-150px] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
          </div>

          <div className="relative px-6 pb-8 sm:px-10">
            <div className="-mt-16">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="h-32 w-32 rounded-3xl border-4 border-[#08102b] object-cover shadow-xl"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-3xl border-4 border-[#08102b] bg-blue-500/10 text-5xl font-black text-blue-400 shadow-xl">
                  {profile.full_name?.charAt(0).toUpperCase() || "S"}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                  {profile.full_name}
                </h1>

                {profile.branch && (
                  <p className="mt-2 text-lg font-semibold text-blue-400">
                    {profile.branch}
                  </p>
                )}

                {profile.college && (
                  <p className="mt-3 flex items-center gap-2 text-slate-400">
                    <span>🎓</span>
                    {profile.college}
                  </p>
                )}

                {profile.graduation_year && (
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Class of {profile.graduation_year}
                  </p>
                )}
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => router.push("/profile/edit")}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-500 md:w-auto"
                >
                  Complete / Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <div className="mt-6 rounded-3xl border border-blue-400/10 bg-blue-500/[0.06] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-white">Profile completeness</p>
                <p className="mt-1 text-xs text-slate-500">
                  Complete your profile to make your student identity stronger.
                </p>
              </div>
              <span className="text-lg font-black text-blue-400">{profileCompletion}%</span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl backdrop-blur-xl sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">👋</div>
                <div>
                  <p className="text-xs font-extrabold tracking-widest text-blue-400">ABOUT</p>
                  <h2 className="text-xl font-black">About me</h2>
                </div>
              </div>

              <p className="mt-6 whitespace-pre-wrap leading-8 text-slate-400">
                {profile.bio || "This student hasn't added a bio yet."}
              </p>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">🚀</div>
                  <div>
                    <p className="text-xs font-extrabold tracking-widest text-blue-400">WORK</p>
                    <h2 className="text-xl font-black">Projects</h2>
                  </div>
                </div>

                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-slate-400">
                  {projects.length}
                </span>
              </div>

              {projects.length === 0 ? (
                <div className="mt-7 rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <div className="text-3xl">🚀</div>
                  <p className="mt-3 font-bold text-slate-400">No projects added yet.</p>
                  {isOwnProfile && (
                    <button
                      onClick={() => router.push("/profile/edit")}
                      className="mt-4 text-sm font-bold text-blue-400 hover:text-blue-300"
                    >
                      Add your first project →
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-7 space-y-5">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-blue-400/20 hover:bg-white/[0.04]"
                    >
                      <div className="flex flex-col justify-between gap-5">
                        <div>
                          <h3 className="text-xl font-extrabold">{project.title}</h3>
                          <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-400">
                            {project.description || "No description added."}
                          </p>
                        </div>

                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((technology) => (
                              <span
                                key={technology}
                                className="rounded-full border border-blue-400/10 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300"
                              >
                                {technology}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                            >
                              GitHub ↗
                            </a>
                          )}

                          {project.live_url && (
                            <a
                              href={project.live_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500"
                            >
                              Live Demo ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">📝</div>
                  <div>
                    <p className="text-xs font-extrabold tracking-widest text-blue-400">CONTRIBUTIONS</p>
                    <h2 className="text-xl font-black">Articles</h2>
                  </div>
                </div>

                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-slate-400">
                  {articles.length}
                </span>
              </div>

              {articles.length === 0 ? (
                <div className="mt-7 rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <div className="text-3xl">📝</div>
                  <p className="mt-3 font-bold text-slate-400">No articles published yet.</p>
                  {isOwnProfile && (
                    <button
                      onClick={() => router.push("/community/new")}
                      className="mt-4 text-sm font-bold text-blue-400 hover:text-blue-300"
                    >
                      Write your first article →
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-7 space-y-4">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-blue-400/20 hover:bg-white/[0.04]"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                          {article.category || "Engineering"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(article.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <h3 className="mt-4 text-xl font-black text-white">{article.title}</h3>
                      <p className="mt-2 line-clamp-3 whitespace-pre-wrap leading-7 text-slate-400">
                        {article.content}
                      </p>

                      <button
                        onClick={() => router.push(`/community/${article.id}`)}
                        className="mt-5 rounded-xl bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-300 transition hover:bg-blue-500/20"
                      >
                        Read article →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl backdrop-blur-xl sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">⚡</div>
                <div>
                  <p className="text-xs font-extrabold tracking-widest text-blue-400">EXPERTISE</p>
                  <h2 className="text-xl font-black">Skills</h2>
                </div>
              </div>

              {profile.skills && profile.skills.length > 0 ? (
                <div className="mt-7 flex flex-wrap gap-2.5">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-xl border border-blue-400/10 bg-blue-500/10 px-3.5 py-2 text-sm font-bold text-blue-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-7 rounded-2xl border border-dashed border-white/10 p-5">
                  <p className="text-sm leading-6 text-slate-500">No skills added yet.</p>
                  {isOwnProfile && (
                    <button
                      onClick={() => router.push("/profile/edit")}
                      className="mt-3 text-sm font-bold text-blue-400 hover:text-blue-300"
                    >
                      Add skills →
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl backdrop-blur-xl sm:p-8">
              <p className="text-xs font-extrabold tracking-widest text-blue-400">EDUCATION</p>
              <h2 className="mt-2 text-xl font-black">Academic profile</h2>

              <div className="mt-6 space-y-5">
                {profile.college && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">College</p>
                    <p className="mt-1 font-bold text-slate-200">{profile.college}</p>
                  </div>
                )}
                {profile.branch && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Branch</p>
                    <p className="mt-1 font-bold text-slate-200">{profile.branch}</p>
                  </div>
                )}
                {profile.graduation_year && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Graduation</p>
                    <p className="mt-1 font-bold text-slate-200">{profile.graduation_year}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl backdrop-blur-xl">
              <p className="text-xs font-extrabold tracking-widest text-blue-400">STUDEXA</p>
              <h2 className="mt-2 text-xl font-black">Explore more</h2>

              <div className="mt-5 space-y-2">
                <button
                  onClick={() => router.push("/students")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  👥 Discover students
                </button>
                <button
                  onClick={() => router.push("/community")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  📝 Visit community
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-left text-sm font-bold text-white transition hover:bg-blue-500"
                >
                  🏠 Go to dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
