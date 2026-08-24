"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
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

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
          "full_name, avatar_url, college, branch, graduation_year, skills, bio"
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
        setAvatarUrl(data.avatar_url || null);
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photo must be smaller than 5MB.");
      return;
    }

    setError("");
    setAvatarFile(file);

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  }

  async function uploadAvatar(
    userId: string,
    file: File
  ) {
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath = `${userId}/avatar-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

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
      setError("You must be logged in.");
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

    try {
      let finalAvatarUrl = avatarUrl;

      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar(
          user.id,
          avatarFile
        );
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: cleanFullName,
          avatar_url: finalAvatarUrl,
          college: cleanCollege,
          branch: cleanBranch,
          graduation_year: year,
          skills: skillList,
          bio: cleanBio,
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        throw updateError;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Unable to save your profile."
      );
      setSaving(false);
    }
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

  const currentAvatar =
    avatarPreview || avatarUrl;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b24] text-white">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0">

        <div className="absolute left-[10%] top-[-250px] h-[600px] w-[600px] rounded-full bg-blue-600/15 blur-[150px]" />

        <div className="absolute right-[-200px] top-[30%] h-[550px] w-[550px] rounded-full bg-cyan-500/10 blur-[150px]" />

        <div className="absolute bottom-[-250px] left-[20%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[150px]" />

      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-[#050b24]/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-6">

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
            Back to Dashboard
          </button>

        </div>

      </nav>

      {/* Main */}
      <section className="relative z-10 mx-auto max-w-3xl px-5 py-10 sm:px-6 md:py-14">

        {/* Heading */}
        <div>

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-2 text-xs font-extrabold tracking-widest text-blue-300">
            PROFILE SETTINGS
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
            Edit your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              profile.
            </span>
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-400">
            Keep your student identity updated and showcase
            what you can do.
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-9 rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >

          {/* Profile Photo */}
          <div className="border-b border-white/10 pb-8">

            <p className="text-xs font-extrabold tracking-widest text-blue-400">
              PROFILE PHOTO
            </p>

            <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">

              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt={fullName || "Profile"}
                  className="h-28 w-28 rounded-3xl object-cover ring-2 ring-blue-400/30"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 text-4xl font-black text-white shadow-xl shadow-blue-600/20">
                  {fullName.charAt(0).toUpperCase() || "S"}
                </div>
              )}

              <div>

                <label
                  htmlFor="avatar"
                  className="inline-flex cursor-pointer rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                >
                  Change photo
                </label>

                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  JPG, PNG or WEBP. Maximum 5MB.
                </p>

              </div>

            </div>

          </div>

          {/* Basic Information */}
          <div className="mt-8">

            <p className="text-xs font-extrabold tracking-widest text-blue-400">
              BASIC INFORMATION
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">

              {/* Name */}
              <div>

                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-bold text-slate-300"
                >
                  Full name
                </label>

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

              {/* College */}
              <div>

                <label
                  htmlFor="college"
                  className="mb-2 block text-sm font-bold text-slate-300"
                >
                  College
                </label>

                <input
                  id="college"
                  type="text"
                  value={college}
                  onChange={(e) =>
                    setCollege(e.target.value)
                  }
                  placeholder="Your college"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

              {/* Branch */}
              <div>

                <label
                  htmlFor="branch"
                  className="mb-2 block text-sm font-bold text-slate-300"
                >
                  Branch
                </label>

                <input
                  id="branch"
                  type="text"
                  value={branch}
                  onChange={(e) =>
                    setBranch(e.target.value)
                  }
                  placeholder="Computer Science Engineering"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

              {/* Graduation */}
              <div>

                <label
                  htmlFor="graduationYear"
                  className="mb-2 block text-sm font-bold text-slate-300"
                >
                  Graduation year
                </label>

                <input
                  id="graduationYear"
                  type="number"
                  min="2000"
                  max="2100"
                  value={graduationYear}
                  onChange={(e) =>
                    setGraduationYear(e.target.value)
                  }
                  placeholder="2027"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

            </div>

          </div>

          {/* Skills */}
          <div className="mt-8">

            <label
              htmlFor="skills"
              className="block text-xs font-extrabold tracking-widest text-blue-400"
            >
              SKILLS
            </label>

            <input
              id="skills"
              type="text"
              value={skills}
              onChange={(e) =>
                setSkills(e.target.value)
              }
              placeholder="Java, Python, React, DSA"
              className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/10"
            />

            <p className="mt-2 text-xs text-slate-500">
              Separate each skill with a comma.
            </p>

          </div>

          {/* Bio */}
          <div className="mt-8">

            <label
              htmlFor="bio"
              className="block text-xs font-extrabold tracking-widest text-blue-400"
            >
              ABOUT YOU
            </label>

            <textarea
              id="bio"
              rows={6}
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              placeholder="Tell other students about yourself, your interests and what you're building..."
              className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/10"
            />

          </div>

          {/* Error */}
          {error && (
            <div className="mt-7 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-semibold leading-6 text-red-300">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving changes..."
                : "Save changes →"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-4 font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              Cancel
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}