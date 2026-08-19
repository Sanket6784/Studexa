"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Post = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  created_at: string;
  user_id: string;
};

type Profile = {
  full_name: string;
  college: string | null;
  branch: string | null;
};

export default function BlogPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadArticle() {
      if (!id) {
        setErrorMessage("No article ID was provided.");
        setLoading(false);
        return;
      }

      console.log("Loading article ID:", id);

      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (postError) {
        console.error("ARTICLE DATABASE ERROR:", postError);
        setErrorMessage(postError.message);
        setLoading(false);
        return;
      }

      if (!postData) {
        setErrorMessage("Article was not found.");
        setLoading(false);
        return;
      }

      setPost(postData);

      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select("full_name, college, branch")
          .eq("id", postData.user_id)
          .maybeSingle();

      if (profileError) {
        console.error("PROFILE DATABASE ERROR:", profileError);
      } else {
        setProfile(profileData);
      }

      setLoading(false);
    }

    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-bold text-slate-900">
          Loading article...
        </p>
      </main>
    );
  }

  if (errorMessage || !post) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">

        <h1 className="text-4xl font-extrabold text-slate-950">
          Unable to load article
        </h1>

        <p className="mt-4 max-w-lg text-slate-600">
          {errorMessage || "This article could not be found."}
        </p>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
        >
          Back to dashboard
        </button>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/")}
            className="text-2xl font-extrabold text-slate-950"
          >
            Studexa<span className="text-blue-600">.</span>
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            Dashboard
          </button>

        </div>
      </nav>

      {/* Article */}
      <article className="mx-auto max-w-4xl px-6 py-14">

        <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
          {post.category || "Engineering"}
        </span>

        <h1 className="mt-6 text-4xl font-extrabold leading-tight text-slate-950 md:text-5xl">
          {post.title}
        </h1>

        {/* Author */}
        <div className="mt-6 border-b border-slate-200 pb-8">

          <p className="font-bold text-slate-900">
            {profile?.full_name || "Studexa Student"}
          </p>

          {(profile?.branch || profile?.college) && (
            <p className="mt-1 text-sm text-slate-500">
              {profile?.branch}
              {profile?.branch && profile?.college ? " • " : ""}
              {profile?.college}
            </p>
          )}

          <p className="mt-2 text-sm text-slate-500">
            Published{" "}
            {new Date(post.created_at).toLocaleDateString()}
          </p>

        </div>

        {/* Content */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">

          <div className="whitespace-pre-wrap text-lg leading-8 text-slate-800">
            {post.content}
          </div>

        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-8 font-bold text-blue-600 hover:text-blue-700"
        >
          ← Back to dashboard
        </button>

      </article>

    </main>
  );
}