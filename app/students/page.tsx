"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Student = {
  id: string;
  full_name: string;
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
          "id, full_name, college, branch, graduation_year, bio, skills"
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
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/")}
            className="text-2xl font-extrabold text-slate-950"
          >
            Studexa<span className="text-blue-600">.</span>
          </button>

          <div className="flex items-center gap-3">

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              Dashboard
            </button>

            <button
              onClick={() => router.push("/community")}
              className="hidden rounded-lg px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 md:block"
            >
              Community
            </button>

          </div>

        </div>
      </nav>

      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 py-12">

        <div className="max-w-3xl">

          <p className="text-sm font-bold tracking-widest text-blue-600">
            STUDEXA NETWORK
          </p>

          <h1 className="mt-3 text-4xl font-extrabold text-slate-950 md:text-5xl">
            Discover students
          </h1>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            Find students, developers and creators based on their
            skills, college and interests.
          </p>

        </div>

        {/* Search */}
        <div className="mt-8 max-w-3xl">

          <div className="relative">

            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, college, branch or skill..."
              className="w-full rounded-2xl border border-slate-300 bg-white px-12 py-4 text-base font-medium text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>

        {/* Results count */}
        <div className="mt-8">

          <p className="text-sm font-bold text-slate-500">
            {filteredStudents.length}{" "}
            {filteredStudents.length === 1
              ? "student"
              : "students"}{" "}
            found
          </p>

        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <p className="font-semibold text-slate-700">
              Finding students...
            </p>

          </div>
        )}

        {/* No students */}
        {!loading && students.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

            <div className="text-4xl">
              👥
            </div>

            <h2 className="mt-4 text-xl font-extrabold text-slate-950">
              No students yet
            </h2>

            <p className="mt-2 text-slate-600">
              Be one of the first students to build a Studexa profile.
            </p>

          </div>
        )}

        {/* No search results */}
        {!loading &&
          students.length > 0 &&
          filteredStudents.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <div className="text-4xl">
                🔎
              </div>

              <h2 className="mt-4 text-xl font-extrabold text-slate-950">
                No students found
              </h2>

              <p className="mt-2 text-slate-600">
                Try searching for another name, college or skill.
              </p>

            </div>
          )}

        {/* Student Cards */}
        {!loading && filteredStudents.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >

                {/* Avatar */}
                <div className="flex items-start justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-xl font-extrabold text-blue-700">
                    {student.full_name
                      ?.charAt(0)
                      .toUpperCase() || "S"}
                  </div>

                  {student.graduation_year && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {student.graduation_year}
                    </span>
                  )}

                </div>

                {/* Name */}
                <h2 className="mt-5 text-xl font-extrabold text-slate-950">
                  {student.full_name}
                </h2>

                {/* Branch */}
                {student.branch && (
                  <p className="mt-1 font-semibold text-slate-600">
                    {student.branch}
                  </p>
                )}

                {/* College */}
                {student.college && (
                  <p className="mt-2 text-sm text-slate-500">
                    🎓 {student.college}
                  </p>
                )}

                {/* Bio */}
                {student.bio && (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                    {student.bio}
                  </p>
                )}

                {/* Skills */}
                {student.skills && student.skills.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">

                    {student.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}

                    {student.skills.length > 4 && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
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
                  className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
                >
                  View Profile →
                </button>

              </div>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}