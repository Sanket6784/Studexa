"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const FIELDS = ["Engineering","Law","Agriculture","Medicine & Healthcare","Commerce & Management","Arts & Humanities","Science","Design & Architecture","Other"];

export default function EditProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [course, setCourse] = useState("");
  const [specialization, setSpecialization] = useState("");
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data, error } = await supabase.from("profiles").select("full_name, avatar_url, college, field_of_study, course, specialization, branch, graduation_year, skills, bio").eq("id", user.id).maybeSingle();
      if (error) setError("Unable to load your profile.");
      if (data) {
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || null);
        setCollege(data.college || "");
        setFieldOfStudy(data.field_of_study || "");
        setCourse(data.course || "");
        setSpecialization(data.specialization || "");
        setBranch(data.branch || "");
        setGraduationYear(data.graduation_year ? String(data.graduation_year) : "");
        setSkills(Array.isArray(data.skills) ? data.skills.join(", ") : "");
        setBio(data.bio || "");
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Profile photo must be smaller than 5MB."); return; }
    setError(""); setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file));
  }

  async function uploadAvatar(userId: string, file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${userId}/avatar-${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from("avatars").upload(filePath, file, { cacheControl: "3600", upsert: true });
    if (error) throw error;
    return supabase.storage.from("avatars").getPublicUrl(filePath).data.publicUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("You must be logged in."); setSaving(false); return; }

    const values = { fullName: fullName.trim(), college: college.trim(), field: fieldOfStudy.trim(), course: course.trim(), specialization: specialization.trim(), branch: branch.trim(), bio: bio.trim() };
    if (!values.fullName || !values.college || !values.field || !values.course || !values.bio) { setError("Please complete your name, college, field, course and bio."); setSaving(false); return; }
    const skillList = skills.split(",").map((s) => s.trim()).filter(Boolean);
    if (!skillList.length) { setError("Please add at least one skill."); setSaving(false); return; }
    const year = Number(graduationYear);
    if (!year || year < 2000 || year > 2100) { setError("Please enter a valid graduation year."); setSaving(false); return; }

    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) finalAvatarUrl = await uploadAvatar(user.id, avatarFile);
      const { error } = await supabase.from("profiles").upsert({ id: user.id, full_name: values.fullName, avatar_url: finalAvatarUrl, college: values.college, field_of_study: values.field, course: values.course, specialization: values.specialization || null, branch: values.branch || null, graduation_year: year, skills: skillList, bio: values.bio, updated_at: new Date().toISOString() });
      if (error) throw error;
      router.push(`/profile/${user.id}`); router.refresh();
    } catch (err: any) {
      console.error(err); setError(err?.message || "Unable to save your profile."); setSaving(false);
    }
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#050b24] text-white"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" /><p className="mt-5 font-bold text-slate-400">Loading your profile...</p></div></main>;

  const avatar = avatarPreview || avatarUrl;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b24] text-white">
      <div className="pointer-events-none fixed inset-0"><div className="absolute left-[10%] top-[-250px] h-[600px] w-[600px] rounded-full bg-blue-600/15 blur-[150px]" /><div className="absolute right-[-200px] top-[30%] h-[550px] w-[550px] rounded-full bg-cyan-500/10 blur-[150px]" /></div>
      <nav className="relative z-10 border-b border-white/10 bg-[#050b24]/80 backdrop-blur-xl"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><button onClick={() => router.push("/")} className="text-2xl font-black">Studexa<span className="text-blue-500">.</span></button><button onClick={() => router.push("/dashboard")} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/[0.08]">Dashboard</button></div></nav>
      <section className="relative z-10 mx-auto max-w-3xl px-5 py-10 md:py-14">
        <div><div className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-2 text-xs font-extrabold tracking-widest text-blue-300">PROFILE SETTINGS</div><h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">Edit your <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">profile.</span></h1><p className="mt-4 text-slate-400">Keep your student identity current across every discipline.</p></div>
        <form onSubmit={handleSubmit} className="mt-9 rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="border-b border-white/10 pb-8"><p className="text-xs font-extrabold tracking-widest text-blue-400">PROFILE PHOTO</p><div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">{avatar ? <img src={avatar} alt={fullName || "Profile"} className="h-28 w-28 rounded-3xl object-cover ring-2 ring-blue-400/30" /> : <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 text-4xl font-black">{fullName.charAt(0).toUpperCase() || "S"}</div>}<div><label htmlFor="avatar" className="inline-flex cursor-pointer rounded-xl bg-blue-600 px-5 py-3 font-bold">Change photo</label><input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" /><p className="mt-3 text-xs text-slate-500">JPG, PNG or WEBP. Maximum 5MB.</p></div></div></div>
          <div className="mt-8"><p className="text-xs font-extrabold tracking-widest text-blue-400">ACADEMIC IDENTITY</p><div className="mt-5 grid gap-5 md:grid-cols-2"><Input label="Full name" value={fullName} onChange={setFullName} placeholder="Your full name" /><Input label="College / University" value={college} onChange={setCollege} placeholder="Your college or university" /></div><div className="mt-5 grid gap-5 md:grid-cols-2"><Select label="Field of study" value={fieldOfStudy} onChange={setFieldOfStudy} options={FIELDS} /><Input label="Course / Program" value={course} onChange={setCourse} placeholder="B.Tech, BA LLB, B.Sc Agriculture..." /></div><div className="mt-5 grid gap-5 md:grid-cols-2"><Input label="Specialization" value={specialization} onChange={setSpecialization} placeholder="Corporate Law, Agronomy, Computer Science..." /><Input label="Branch / Major (optional)" value={branch} onChange={setBranch} placeholder="CSE, Finance, Psychology..." /></div><div className="mt-5 grid gap-5 md:grid-cols-2"><Input label="Graduation year" value={graduationYear} onChange={setGraduationYear} placeholder="2027" type="number" /><Input label="Skills" value={skills} onChange={setSkills} placeholder="Research, Python, Drafting, Design..." /></div><div className="mt-2 text-xs text-slate-500">Separate skills with commas.</div></div>
          <div className="mt-8"><label className="text-xs font-extrabold tracking-widest text-blue-400">ABOUT YOU</label><textarea required rows={6} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell other students about your interests, work and goals..." className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 leading-7 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" /></div>
          {error && <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-300">{error}</div>}
          <button type="submit" disabled={saving} className="mt-7 w-full rounded-xl bg-blue-600 px-6 py-4 font-black shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:opacity-60">{saving ? "Saving your profile..." : "Save changes →"}</button>
        </form>
      </section>
    </main>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) { return <div><label className="mb-2 block text-sm font-bold text-slate-300">{label}</label><input type={type} min={type === "number" ? "2000" : undefined} max={type === "number" ? "2100" : undefined} required={label !== "Specialization" && label !== "Branch / Major (optional)"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white placeholder:text-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" /></div>; }
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <div><label className="mb-2 block text-sm font-bold text-slate-300">{label}</label><select required value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a1230] px-4 py-3.5 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"><option value="">Select your field</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>; }
