"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const FIELDS = [
  "Engineering",
  "Law",
  "Agriculture",
  "Medicine & Healthcare",
  "Commerce & Management",
  "Arts & Humanities",
  "Science",
  "Design & Architecture",
  "Other",
];

export default function ProfileSetupPage() {
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, college, field_of_study, course, specialization, branch, graduation_year, skills, bio")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        setError("Unable to load your profile.");
      } else if (data) {
        setFullName(data.full_name || "");
        setCollege(data.college || "");
        setFieldOfStudy(data.field_of_study || "");
        setCourse(data.course || "");
        setSpecialization(data.specialization || "");
        setBranch(data.branch || "");
        setGraduationYear(data.graduation_year ? String(data.graduation_year) : "");
        setSkills(Array.isArray(data.skills) ? data.skills.join(", ") : "");
        setBio(data.bio || "");
      } else if (user.user_metadata?.full_name) {
        setFullName(user.user_metadata.full_name);
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to create a profile.");
      setSaving(false);
      return;
    }

    const values = {
      fullName: fullName.trim(),
      college: college.trim(),
      fieldOfStudy: fieldOfStudy.trim(),
      course: course.trim(),
      specialization: specialization.trim(),
      branch: branch.trim(),
      bio: bio.trim(),
    };

    if (!values.fullName || !values.college || !values.fieldOfStudy || !values.course || !values.bio) {
      setError("Please complete your name, college, field, course and bio.");
      setSaving(false);
      return;
    }

    const skillList = skills.split(",").map((skill) => skill.trim()).filter(Boolean);
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

    const { error: saveError } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: values.fullName,
      college: values.college,
      field_of_study: values.fieldOfStudy,
      course: values.course,
      specialization: values.specialization || null,
      branch: values.branch || null,
      graduation_year: year,
      skills: skillList,
      bio: values.bio,
      updated_at: new Date().toISOString(),
    });

    if (saveError) {
      console.error(saveError);
      setError(saveError.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard");
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#050b24] text-white"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" /><p className="mt-5 font-bold text-slate-400">Loading your profile...</p></div></main>;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b24] text-white">
      <div className="pointer-events-none absolute left-[-180px] top-[-180px] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-200px] right-[-200px] h-[550px] w-[550px] rounded-full bg-cyan-500/10 blur-[150px]" />

      <nav className="relative z-10 border-b border-white/10 bg-[#050b24]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="text-2xl font-black tracking-tight">Studexa<span className="text-blue-500">.</span></button>
          <button onClick={() => router.push("/dashboard")} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white">Dashboard</button>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="text-center">
          <div className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-extrabold tracking-widest text-blue-300">YOUR STUDENT IDENTITY</div>
          <h1 className="mt-6 text-4xl font-black tracking-tight md:text-5xl">Build your <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">profile.</span></h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-400">Tell students who you are, what you study, what you know and what you're building.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 rounded-3xl border border-white/10 bg-white/[0.055] p-7 shadow-2xl backdrop-blur-xl md:p-9">
          <p className="text-xs font-extrabold tracking-widest text-blue-400">ACADEMIC IDENTITY</p>
          <h2 className="mt-2 text-2xl font-black">Where do you belong?</h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Input label="Full name" value={fullName} onChange={setFullName} placeholder="Your full name" />
            <Input label="College / University" value={college} onChange={setCollege} placeholder="Your college or university" />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div><label className="mb-2 block text-sm font-bold text-slate-200">Field of study</label><select value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} required className="w-full rounded-xl border border-white/10 bg-[#0a1230] px-4 py-3.5 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"><option value="">Select your field</option>{FIELDS.map((field) => <option key={field} value={field}>{field}</option>)}</select></div>
            <Input label="Course / Program" value={course} onChange={setCourse} placeholder="B.Tech, BA LLB, B.Sc Agriculture..." />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Input label="Specialization" value={specialization} onChange={setSpecialization} placeholder="Corporate Law, Agronomy, Computer Science..." />
            <Input label="Branch / Major (optional)" value={branch} onChange={setBranch} placeholder="CSE, Finance, Psychology..." />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div><label className="mb-2 block text-sm font-bold text-slate-200">Graduation year</label><input type="number" min="2000" max="2100" required value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="2027" className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
            <div><label className="mb-2 block text-sm font-bold text-slate-200">Skills</label><input type="text" required value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Research, Python, Drafting, Design..." className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /><p className="mt-2 text-xs text-slate-500">Separate skills with commas.</p></div>
          </div>

          <div className="mt-5"><label className="mb-2 block text-sm font-bold text-slate-200">Bio</label><textarea required rows={5} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell other students about your interests, work and goals..." className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 leading-7 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>

          <div className="mt-7 rounded-2xl border border-blue-400/10 bg-blue-500/[0.04] p-5"><p className="text-xs font-extrabold tracking-widest text-blue-400">STUDEXA</p><p className="mt-2 text-sm leading-6 text-slate-400">Your field, course and specialization help other students discover you across disciplines.</p></div>

          {error && <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-300">{error}</div>}
          <button type="submit" disabled={saving} className="mt-7 w-full rounded-xl bg-blue-600 px-6 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving your profile..." : "Complete my profile →"}</button>
        </form>
      </section>
    </main>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <div><label className="mb-2 block text-sm font-bold text-slate-200">{label}</label><input type="text" required value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>;
}
