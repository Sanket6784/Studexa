"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Review = {
  id: string;
  name: string | null;
  rating: number;
  feedback: string;
  created_at: string;
};

export default function FeedbackReviews() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    const { data, error } = await supabase
      .from("feedback_reviews")
      .select("id, name, rating, feedback, created_at")
      .order("created_at", { ascending: false })
      .limit(6);

    if (!error) setReviews(data || []);
    setLoading(false);
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (feedback.trim().length < 3) {
      setMessage("Please enter a little more feedback.");
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase
      .from("feedback_reviews")
      .insert({
        name: name.trim() || null,
        rating,
        feedback: feedback.trim(),
      })
      .select("id, name, rating, feedback, created_at")
      .single();

    if (error) {
      console.error(error);
      setMessage("Could not submit your review. Please try again.");
      setSubmitting(false);
      return;
    }

    setReviews((current) => [data, ...current].slice(0, 6));
    setName("");
    setRating(5);
    setFeedback("");
    setMessage("Thanks for your feedback!");
    setSubmitting(false);
  }

  return (
    <section className="border-y border-slate-200 bg-[#f7f9fc]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Feedback & reviews</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.03em] text-slate-950 sm:text-5xl">Help shape Technerva.</h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">Your feedback helps us build a better platform for engineering students and creators.</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <form onSubmit={submitReview} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-2xl font-black text-slate-950">Leave a review</h3>

            <label className="mt-6 block text-sm font-bold text-slate-700">
              Name <span className="font-normal text-slate-400">(optional)</span>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" />
            </label>

            <fieldset className="mt-6">
              <legend className="text-sm font-bold text-slate-700">Rating</legend>
              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} type="button" aria-label={`${value} star rating`} onClick={() => setRating(value)} className={`text-2xl transition ${value <= rating ? "text-amber-400" : "text-slate-300"}`}>
                    ★
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="mt-6 block text-sm font-bold text-slate-700">
              Feedback
              <textarea required minLength={3} maxLength={2000} value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="What should we improve or keep doing?" rows={6} className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 leading-7 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" />
            </label>

            {message && <p className="mt-4 text-sm font-semibold text-blue-600">{message}</p>}

            <button type="submit" disabled={submitting} className="mt-6 w-full rounded-xl bg-slate-950 px-6 py-3.5 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? "Submitting..." : "Submit review"}
            </button>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-black text-slate-950">What people say</h3>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">Latest</span>
            </div>

            {loading ? (
              <p className="mt-8 text-slate-400">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <p className="font-bold text-slate-700">No reviews yet.</p>
                <p className="mt-2 text-sm text-slate-400">Be the first to share your experience.</p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-bold text-slate-950">{review.name || "Technerva User"}</p>
                      <p className="text-sm tracking-wide text-amber-400">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                    </div>
                    <p className="mt-3 leading-7 text-slate-600">{review.feedback}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
