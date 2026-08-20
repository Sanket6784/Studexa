"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ProfileSetupPage() {
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
        .select(
          "full_name, college, branch, graduation_year, skills, bio"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        setError("Unable to load your profile.");
        setLoading(false);
        return;
      }

      if (data) {
        setFullName(data.full_name || "");
        setCollege(data.college || "");
        setBranch(data.branch || "");
        setGraduationYear(
          data.graduation_year
            ? String(data.graduation_year)
            : ""
        );
        setSkills(
          Array.isArray(data.skills)
            ? data.skills.join(", ")
            : ""
        );
        setBio(data.bio || "");
      } else if (user.user_metadata?.full_name) {
        setFullName(user.user_metadata.full_name);
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to create a profile.");
      setSaving(false);
      return;
    }

    const cleanFullName = fullName.trim();
    const cleanCollege = college.trim();
    const cleanBranch = branch.trim();
    const cleanBio = bio.trim();

    if (!cleanFullName) {
      setError("Please enter your full name.");
      setSaving(false);
      return;
    }

    if (!cleanCollege) {
      setError("Please enter your college.");
      setSaving(false);
      return;
    }

    if (!cleanBranch) {
      setError("Please enter your branch.");
      setSaving(false);
      return;
    }

    if (!cleanBio) {
      setError("Please write a short bio.");
      setSaving(false);
      return;
    }

    const skillList = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (skillList.length === 0) {
      setError("Please add at least one skill.");
      setSaving(false);
      return;
    }

    const year = Number(graduationYear);

    if (!year || year < 2000 || year > 2100) {
      setError("Please enter a valid graduation year.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: cleanFullName,
        college: cleanCollege,
        branch: cleanBranch,
        graduation_year: year,
        skills: skillList,
        bio: cleanBio,
        updated_at: new Date().toISOString(),
      });

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
          Loading your profile...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">

      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="text-center">

          <p className="text-sm font-bold tracking-widest text-blue-600">
            WELCOME TO STUDEXA
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-slate-950">
            Build your student profile
          </h1>

          <p className="mt-3 text-lg text-slate-600">
            Tell other students who you are and what you're building.
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >

          {/* Full Name + College */}
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
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                min="2000"
                max="2100"
                value={graduationYear}
                onChange={(e) =>
                  setGraduationYear(e.target.value)
                }
                placeholder="2027"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Java, Python, React, DSA"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-xs font-medium text-slate-500">
              Separate your skills with commas.
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
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself..."
              rows={5}
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium leading-7 text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-xs font-medium text-slate-500">
              Keep it short and tell people what you're interested in.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving your profile..."
              : "Complete my profile →"}
          </button>

        </form>

      </div>

    </main>
  );
}