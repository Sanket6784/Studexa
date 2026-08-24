"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Student = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  college: string | null;
  branch: string | null;
  graduation_year: number | null;
  bio: string | null;
  skills: string[] | null;
};

export default function StudentsPage() {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, avatar_url, college, branch, graduation_year, bio, skills"
        )
        .order("full_name", { ascending: true });

      if (error) {
        console.error("STUDENTS ERROR:", error);
        setLoading(false);
        return;
      }

      setStudents(data || []);
      setLoading(false);
    }

    loadStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return true;

    const name = student.full_name?.toLowerCase() || "";
    const college = student.college?.toLowerCase() || "";
    const branch = student.branch?.toLowerCase() || "";
    const skills = student.skills?.join(" ").toLowerCase() || "";

    return (
      name.includes(searchText) ||
      college.includes(searchText) ||
      branch.includes(searchText) ||
      skills.includes(searchText)
    );
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b24] text-white">

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">

        <div className="absolute left-[10%] top-[-250px] h-[600px] w-[600px] rounded-full bg-blue-600/15 blur-[150px]" />

        <div className="absolute right-[-200px] top-[25%] h-[550px] w-[550px] rounded-full bg-cyan-500/10 blur-[150px]" />

        <div className="absolute bottom-[-300px] left-[25%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[150px]" />

      </div>

      {/* Navbar */}
      <nav className="relative z-20 border-b border-white/10 bg-[#050b24]/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-6">

          <button
            onClick={() => router.push("/")}
            className="text-2xl font-black tracking-tight"
          >
            Studexa<span className="text-blue-500">.</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">

            <button
              onClick={() => router.push("/community")}
              className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-slate-400 transition hover:bg-white/[0.05] hover:text-white md:block"
            >
              Community
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              Dashboard
            </button>

          </div>

        </div>

      </nav>

      {/* Main */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-6 md:py-16">

        {/* Header */}
        <div className="max-w-3xl">

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-2 text-xs font-extrabold tracking-widest text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            STUDEXA NETWORK
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            Discover{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              students.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
            Find students, developers and creators based on their
            skills, college and interests.
          </p>

        </div>

        {/* Search */}
        <div className="mt-9 max-w-3xl">

          <div className="relative">

            <div className="pointer-events-none absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-white/[0.05] text-lg">
              🔍
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, college, branch or skill..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.055] py-4 pl-16 pr-5 text-base font-medium text-white shadow-xl outline-none backdrop-blur-xl transition placeholder:text-slate-500 focus:border-blue-400/40 focus:bg-white/[0.07] focus:ring-4 focus:ring-blue-500/10"
            />

          </div>

        </div>

        {/* Result info */}
        <div className="mt-8 flex items-center justify-between">

          <div>
            <p className="text-sm font-bold text-slate-500">
              {filteredStudents.length}{" "}
              {filteredStudents.length === 1
                ? "student"
                : "students"}{" "}
              found
            </p>
          </div>

          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-sm font-bold text-blue-400 transition hover:text-blue-300"
            >
              Clear search
            </button>
          )}

        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.045] p-12 text-center shadow-xl backdrop-blur-xl">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />

            <p className="mt-5 font-bold text-slate-400">
              Finding students...
            </p>

          </div>
        )}

        {/* No students */}
        {!loading && students.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-white/[0.035] p-12 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl">
              👥
            </div>

            <h2 className="mt-5 text-2xl font-black">
              No students yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-500">
              Be one of the first students to build a Studexa profile.
            </p>

          </div>
        )}

        {/* No results */}
        {!loading &&
          students.length > 0 &&
          filteredStudents.length === 0 && (
            <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-white/[0.035] p-12 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.05] text-3xl">
                🔎
              </div>

              <h2 className="mt-5 text-2xl font-black">
                No students found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-slate-500">
                Try searching for another name, college or skill.
              </p>

            </div>
          )}

        {/* Student Cards */}
        {!loading && filteredStudents.length > 0 && (
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {filteredStudents.map((student) => (
              <article
                key={student.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-400/25 hover:bg-white/[0.065] hover:shadow-2xl"
              >

                {/* Card glow */}
                <div className="pointer-events-none absolute right-[-80px] top-[-100px] h-48 w-48 rounded-full bg-blue-500/10 blur-[70px] opacity-0 transition group-hover:opacity-100" />

                {/* Top */}
                <div className="relative flex items-start justify-between">

                  {/* Avatar */}
                  {student.avatar_url ? (
                    <img
                      src={student.avatar_url}
                      alt={student.full_name}
                      className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/10"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-black text-white shadow-lg shadow-blue-600/20">
                      {student.full_name
                        ?.charAt(0)
                        .toUpperCase() || "S"}
                    </div>
                  )}

                  {student.graduation_year && (
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-slate-400">
                      {student.graduation_year}
                    </span>
                  )}

                </div>

                {/* Name */}
                <h2 className="relative mt-6 text-xl font-black text-white">
                  {student.full_name}
                </h2>

                {/* Branch */}
                {student.branch && (
                  <p className="relative mt-1 font-semibold text-slate-400">
                    {student.branch}
                  </p>
                )}

                {/* College */}
                {student.college && (
                  <p className="relative mt-3 text-sm text-slate-500">
                    🎓 {student.college}
                  </p>
                )}

                {/* Bio */}
                {student.bio && (
                  <p className="relative mt-5 line-clamp-3 text-sm leading-6 text-slate-500">
                    {student.bio}
                  </p>
                )}

                {/* Skills */}
                {student.skills &&
                  student.skills.length > 0 && (
                    <div className="relative mt-5 flex flex-wrap gap-2">

                      {student.skills
                        .slice(0, 4)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300"
                          >
                            {skill}
                          </span>
                        ))}

                      {student.skills.length > 4 && (
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-500">
                          +{student.skills.length - 4}
                        </span>
                      )}

                    </div>
                  )}

                {/* Profile Button */}
                <button
                  onClick={() =>
                    router.push(`/profile/${student.id}`)
                  }
                  className="relative mt-6 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 hover:shadow-blue-600/30"
                >
                  View Profile
                  <span className="ml-2 transition group-hover:translate-x-1">
                    →
                  </span>
                </button>

              </article>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}