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
  const [success, setSuccess] = useState("");

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

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setFullName(data.full_name || "");
      setCollege(data.college || "");
      setBranch(data.branch || "");
      setGraduationYear(
        data.graduation_year ? String(data.graduation_year) : ""
      );
      setSkills(data.skills ? data.skills.join(", ") : "");
      setBio(data.bio || "");

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

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
      setError(error.message);
      setSaving(false);
      return;
    }

    setSuccess("Profile updated successfully!");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-semibold text-slate-900">
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
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Back to dashboard
          </button>

        </div>
      </nav>

      {/* Page */}
      <section className="mx-auto max-w-3xl px-6 py-12">

        <div className="text-center">

          <p className="text-sm font-bold tracking-widest text-blue-600">
            YOUR PROFILE
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-slate-950">
            Edit your profile
          </h1>

          <p className="mt-3 text-slate-600">
            Keep your Studexa profile up to date.
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >

          {/* Name + College */}
          <div className="grid gap-6 md:grid-cols-2">

            <InputField
              label="Full name"
              value={fullName}
              setValue={setFullName}
              placeholder="Your full name"
            />

            <InputField
              label="College"
              value={college}
              setValue={setCollege}
              placeholder="Your college"
            />

          </div>

          {/* Branch + Graduation */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">

            <InputField
              label="Branch"
              value={branch}
              setValue={setBranch}
              placeholder="Computer Science Engineering"
            />

            <InputField
              label="Graduation year"
              value={graduationYear}
              setValue={setGraduationYear}
              placeholder="2027"
              type="number"
            />

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
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-xs font-medium text-slate-500">
              Separate each skill with a comma.
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
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other students about yourself..."
              rows={6}
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
              {success}
            </div>
          )}

          {/* Save */}
          <button
            type="submit"
            disabled={saving}
            className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving changes..." : "Save changes"}
          </button>

        </form>

      </section>
    </main>
  );
}

function InputField({
  label,
  value,
  setValue,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>

      <label
        className="mb-2 block text-sm font-bold text-slate-800"
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />

    </div>
  );
}