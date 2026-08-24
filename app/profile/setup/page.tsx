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
      <main className="flex min-h-screen items-center justify-center bg-[#050b24] text-white">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />

          <p className="mt-5 font-bold text-slate-400">
            Loading your profile...
          </p>

        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b24] text-white">

      {/* Background glow */}
      <div className="pointer-events-none absolute left-[-180px] top-[-180px] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[140px]" />

      <div className="pointer-events-none absolute right-[-200px] bottom-[-200px] h-[550px] w-[550px] rounded-full bg-cyan-500/10 blur-[150px]" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-[#050b24]/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/")}
            className="text-2xl font-black tracking-tight"
          >
            Studexa<span className="text-blue-500">.</span>
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            Dashboard
          </button>

        </div>

      </nav>

      {/* Content */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-12 md:py-16">

        {/* Header */}
        <div className="text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-extrabold tracking-widest text-blue-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            YOUR STUDENT IDENTITY
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight md:text-5xl">
            Build your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              profile.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-400">
            Tell other students who you are, what you know,
            and what you're interested in building.
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-3xl border border-white/10 bg-white/[0.055] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-9"
        >

          {/* Section heading */}
          <div className="mb-8">

            <p className="text-xs font-extrabold tracking-widest text-blue-400">
              BASIC INFORMATION
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Tell us about yourself
            </h2>

          </div>

          {/* Name + College */}
          <div className="grid gap-5 md:grid-cols-2">

            <InputField
              id="fullName"
              label="Full name"
              value={fullName}
              onChange={setFullName}
              placeholder="Your full name"
            />

            <InputField
              id="college"
              label="College"
              value={college}
              onChange={setCollege}
              placeholder="Your college"
            />

          </div>

          {/* Branch + Graduation */}
          <div className="mt-5 grid gap-5 md:grid-cols-2">

            <InputField
              id="branch"
              label="Branch"
              value={branch}
              onChange={setBranch}
              placeholder="Computer Science Engineering"
            />

            <div>
              <label
                htmlFor="graduationYear"
                className="mb-2 block text-sm font-bold text-slate-200"
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
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:bg-white/[0.08] focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

          </div>

          {/* Skills */}
          <div className="mt-5">

            <label
              htmlFor="skills"
              className="mb-2 block text-sm font-bold text-slate-200"
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
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:bg-white/[0.08] focus:ring-2 focus:ring-blue-500/20"
            />

            <p className="mt-2 text-xs font-medium text-slate-500">
              Separate your skills with commas.
            </p>

          </div>

          {/* Bio */}
          <div className="mt-5">

            <label
              htmlFor="bio"
              className="mb-2 block text-sm font-bold text-slate-200"
            >
              Bio
            </label>

            <textarea
              id="bio"
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself, your interests and what you're building..."
              rows={5}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 leading-7 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:bg-white/[0.08] focus:ring-2 focus:ring-blue-500/20"
            />

            <p className="mt-2 text-xs font-medium text-slate-500">
              Keep it short and make it interesting.
            </p>

          </div>

          {/* Preview */}
          <div className="mt-8 rounded-2xl border border-blue-400/10 bg-blue-500/[0.04] p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                ✦
              </div>

              <div>
                <p className="text-xs font-extrabold tracking-widest text-blue-400">
                  PROFILE PREVIEW
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Your information will appear on your public profile.
                </p>
              </div>

            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="mt-7 w-full rounded-xl bg-blue-600 px-6 py-4 text-base font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving your profile..."
              : "Complete my profile →"}
          </button>

        </form>

      </section>

    </main>
  );
}

function InputField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>

      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold text-slate-200"
      >
        {label}
      </label>

      <input
        id={id}
        type="text"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:bg-white/[0.08] focus:ring-2 focus:ring-blue-500/20"
      />

    </div>
  );
}