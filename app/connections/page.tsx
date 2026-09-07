"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Profile = {
  id: string;
  full_name: string;
  college: string | null;
  branch: string | null;
  course: string | null;
  field_of_study: string | null;
  skills: string[] | null;
};

type Connection = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
};

export default function ConnectionsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNetwork();
  }, []);

  async function loadNetwork() {
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    setUserId(user.id);

    const [{ data: profileData, error: profileError }, { data: connectionData, error: connectionError }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, college, branch, course, field_of_study, skills")
        .neq("id", user.id)
        .order("full_name", { ascending: true }),
      supabase
        .from("connections")
        .select("id, requester_id, receiver_id, status")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
    ]);

    if (profileError || connectionError) {
      console.error(profileError || connectionError);
      setError("Connections are being prepared. Please refresh in a moment.");
      setLoading(false);
      return;
    }

    setProfiles((profileData || []) as Profile[]);
    setConnections((connectionData || []) as Connection[]);
    setLoading(false);
  }

  async function sendRequest(receiverId: string) {
    if (!userId) return;
    setBusyId(receiverId);
    setError("");

    const { data, error: insertError } = await supabase
      .from("connections")
      .insert({ requester_id: userId, receiver_id: receiverId })
      .select("id, requester_id, receiver_id, status")
      .single();

    if (insertError) {
      console.error(insertError);
      setError(insertError.code === "23505" ? "You already have a connection request with this student." : "Could not send the request.");
    } else if (data) {
      setConnections((current) => [...current, data as Connection]);
    }

    setBusyId(null);
  }

  async function respond(connection: Connection, status: "accepted" | "rejected") {
    setBusyId(connection.id);
    setError("");

    const { error: updateError } = await supabase
      .from("connections")
      .update({ status })
      .eq("id", connection.id);

    if (updateError) {
      console.error(updateError);
      setError("Could not update the connection request.");
    } else {
      setConnections((current) => current.map((item) => item.id === connection.id ? { ...item, status } : item));
    }

    setBusyId(null);
  }

  const incoming = useMemo(
    () => connections.filter((connection) => connection.receiver_id === userId && connection.status === "pending"),
    [connections, userId]
  );

  const connectedIds = useMemo(
    () => new Set(connections.filter((connection) => connection.status === "accepted").map((connection) => connection.requester_id === userId ? connection.receiver_id : connection.requester_id)),
    [connections, userId]
  );

  const outgoingPendingIds = useMemo(
    () => new Set(connections.filter((connection) => connection.requester_id === userId && connection.status === "pending").map((connection) => connection.receiver_id)),
    [connections, userId]
  );

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return profiles.slice(0, 12);
    return profiles.filter((profile) => [
      profile.full_name,
      profile.college,
      profile.branch,
      profile.course,
      profile.field_of_study,
      ...(profile.skills || []),
    ].filter(Boolean).join(" ").toLowerCase().includes(query)).slice(0, 20);
  }, [profiles, search]);

  const profileById = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles]);

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] text-slate-500"><p className="font-bold">Loading your network...</p></main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">T</span>
            <span className="text-xl font-black tracking-tight">Technerva</span>
          </button>
          <button onClick={() => router.push("/dashboard")} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Dashboard</button>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 md:py-14">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Your network</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.03em] sm:text-5xl">Connections</h1>
          <p className="mt-4 text-lg leading-8 text-slate-500">Meet engineers, share ideas and build a network around what you are learning and creating.</p>
        </div>

        {error && <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">{error}</div>}

        {incoming.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black">Connection requests</h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{incoming.length} pending</span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {incoming.map((connection) => {
                const profile = profileById.get(connection.requester_id);
                if (!profile) return null;
                return <div key={connection.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <button onClick={() => router.push(`/profile/${profile.id}`)} className="min-w-0 text-left">
                    <p className="truncate font-extrabold">{profile.full_name}</p>
                    <p className="mt-1 truncate text-sm text-slate-500">{profile.college || "Engineering student"}{profile.branch ? ` · ${profile.branch}` : ""}</p>
                  </button>
                  <div className="flex shrink-0 gap-2">
                    <button disabled={busyId === connection.id} onClick={() => respond(connection, "accepted")} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Accept</button>
                    <button disabled={busyId === connection.id} onClick={() => respond(connection, "rejected")} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-50">Decline</button>
                  </div>
                </div>;
              })}
            </div>
          </section>
        )}

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Discover</p>
              <h2 className="mt-2 text-2xl font-black">Find engineering students</h2>
            </div>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, college, branch or skills" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:max-w-sm" />
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfiles.map((profile) => {
              const connected = connectedIds.has(profile.id);
              const pending = outgoingPendingIds.has(profile.id);
              return <article key={profile.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
                <button onClick={() => router.push(`/profile/${profile.id}`)} className="text-left">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">{profile.full_name?.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div>
                    <div className="min-w-0">
                      <p className="truncate font-extrabold">{profile.full_name}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{profile.branch || profile.course || "Engineering"}</p>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-1 text-sm text-slate-500">{profile.college || "Engineering student"}</p>
                </button>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(profile.skills || []).slice(0, 3).map((skill) => <span key={skill} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">{skill}</span>)}
                </div>
                {connected ? (
                  <div className="mt-5 rounded-xl bg-emerald-50 px-4 py-2.5 text-center text-xs font-bold text-emerald-700">Connected</div>
                ) : pending ? (
                  <div className="mt-5 rounded-xl bg-blue-50 px-4 py-2.5 text-center text-xs font-bold text-blue-700">Request sent</div>
                ) : (
                  <button disabled={busyId === profile.id} onClick={() => sendRequest(profile.id)} className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50">{busyId === profile.id ? "Sending..." : "Connect"}</button>
                )}
              </article>;
            })}
          </div>

          {filteredProfiles.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm font-semibold text-slate-500">No students matched your search.</div>}
        </section>
      </section>
    </main>
  );
}
