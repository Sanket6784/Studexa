"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function EditProfilePage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        setError("Could not load your profile.");
        setLoading(false);
        return;
      }

      setFullName(data.full_name || "");
      setCollege(data.college || "");
      setBranch(data.branch || "");
      setGraduationYear(
        data.graduation_year ? String(data.graduation_year) : ""
      );
      setSkills(data.skills?.join(", ") || "");
      setBio(data.bio || "");

      setLoading(false);
    }

    loadProfile();
  }, [router]);

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

    const skillList = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        college,
        branch,
        graduation_year: graduationYear
          ? Number(graduationYear)
          : null,
        skills: skillList,
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-bold text-slate-900">
          Loading profile...
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
            onClick={() => router.push("/dashboard")}
            className="text-2xl font-extrabold text-slate-950"
          >
            Studexa<span className="text-blue-600">.</span>
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            Back to dashboard
          </button>

        </div>
      </nav>

      {/* Page */}
      <section className="mx-auto max-w-3xl px-6 py-12">

        {/* Header */}
        <div className="text-center">

          <p className="text-sm font-bold tracking-widest text-blue-600">
            YOUR PROFILE
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-slate-950">
            Edit your profile
          </h1>

          <p className="mt-3 text-slate-600">
            Keep your student identity up to date.
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

          {/* Name + College */}
          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Full name
              </label>

              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="college"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                College
              </label>

              <input
                id="college"
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="Your college"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

          </div>

          {/* Branch + Graduation */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">

            <div>
              <label
                htmlFor="branch"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Branch
              </label>

              <input
                id="branch"
                type="text"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Computer Science Engineering"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="graduationYear"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Graduation year
              </label>

              <input
                id="graduationYear"
                type="number"
                required
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="2027"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

          </div>

          {/* Skills */}
          <div className="mt-6">

            <label
              htmlFor="skills"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Skills
            </label>

            <input
              id="skills"
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Java, Python, React, DSA"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-xs text-slate-500">
              Separate skills with commas.
            </p>

          </div>

          {/* Bio */}
          <div className="mt-6">

            <label
              htmlFor="bio"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Bio
            </label>

            <textarea
              id="bio"
              rows={6}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving changes..." : "Save Changes →"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-800 hover:bg-slate-50"
            >
              Cancel
            </button>

          </div>

        </form>

      </section>
    </main>
  );
}