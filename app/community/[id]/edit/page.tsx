"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Post = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string | null;
};

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();

  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (postId) {
      loadArticle();
    }
  }, [postId]);

  async function loadArticle() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .select("id, user_id, title, content, category")
      .eq("id", postId)
      .maybeSingle();

    if (error) {
      console.error("LOAD ARTICLE ERROR:", error);
      setError("Could not load this article.");
      setLoading(false);
      return;
    }

    if (!data) {
      setError("Article not found.");
      setLoading(false);
      return;
    }

    // Only the article owner can edit it.
    if (data.user_id !== user.id) {
      setError("You are not allowed to edit this article.");
      setLoading(false);
      return;
    }

    setPost(data);
    setTitle(data.title || "");
    setContent(data.content || "");
    setCategory(data.category || "");

    setLoading(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedCategory = category.trim();

    if (trimmedTitle.length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }

    if (trimmedContent.length < 20) {
      setError("Content must be at least 20 characters.");
      return;
    }

    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (!post || post.user_id !== user.id) {
      setError("You are not allowed to edit this article.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title: trimmedTitle,
        content: trimmedContent,
        category: trimmedCategory || null,
      })
      .eq("id", postId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("UPDATE ARTICLE ERROR:", updateError);
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push(`/community/${postId}`);
    router.refresh();
  }

  async function deleteArticle() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this article?"
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (!post || post.user_id !== user.id) {
      setError("You are not allowed to delete this article.");
      setDeleting(false);
      return;
    }

    // Delete comments first.
    const { error: commentsError } = await supabase
      .from("post_comments")
      .delete()
      .eq("post_id", postId);

    if (commentsError) {
      console.error("DELETE COMMENTS ERROR:", commentsError);
      setError("Could not delete the article comments.");
      setDeleting(false);
      return;
    }

    // Delete likes.
    const { error: likesError } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId);

    if (likesError) {
      console.error("DELETE LIKES ERROR:", likesError);
      setError("Could not delete the article likes.");
      setDeleting(false);
      return;
    }

    // Delete article.
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("DELETE ARTICLE ERROR:", deleteError);
      setError(deleteError.message);
      setDeleting(false);
      return;
    }

    router.push("/community");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

          <p className="mt-5 font-bold text-slate-300">
            Loading article...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="absolute right-[-200px] top-[400px] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[-200px] h-[450px] w-[450px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">

          <button
            onClick={() => router.push("/dashboard")}
            className="text-xl font-extrabold tracking-tight text-white sm:text-2xl"
          >
            Studexa<span className="text-blue-500">.</span>
          </button>

          <button
            onClick={() => router.push(`/community/${postId}`)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/10"
          >
            ← Article
          </button>

        </div>
      </nav>

      {/* Page */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">

        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-blue-400">
            COMMUNITY
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Edit Article
          </h1>

          <p className="mt-3 text-base leading-7 text-slate-400">
            Update your article and save your changes.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-bold text-slate-200"
            >
              Article title
            </label>

            <input
              id="title"
              type="text"
              required
              minLength={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          {/* Category */}
          <div className="mt-6">
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-bold text-slate-200"
            >
              Category
            </label>

            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Engineering, Career, Projects..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          {/* Content */}
          <div className="mt-6">
            <label
              htmlFor="content"
              className="mb-2 block text-sm font-bold text-slate-200"
            >
              Content
            </label>

            <textarea
              id="content"
              required
              minLength={20}
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article..."
              className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
            />

            <p className="mt-2 text-xs font-medium text-slate-500">
              Minimum 20 characters.
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button
              type="submit"
              disabled={saving || deleting}
              className="flex-1 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes →"}
            </button>

            <button
              type="button"
              disabled={saving || deleting}
              onClick={() =>
                router.push(`/community/${postId}`)
              }
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>

          </div>

          {/* Delete */}
          <div className="mt-8 border-t border-white/10 pt-6">

            <p className="text-sm text-slate-500">
              Deleting an article permanently removes the article,
              its likes and its comments.
            </p>

            <button
              type="button"
              disabled={saving || deleting}
              onClick={deleteArticle}
              className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Article"}
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}