"use client";
import { type FormEvent, useState } from "react";
import { api } from "@/lib/api";
export default function FeedbackPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api.feedback({
        experience: String(form.get("experience") ?? ""),
        suggestions: String(form.get("suggestions") ?? ""),
      });
      setSent(true);
    } catch {
      setError("Feedback could not be submitted. Please try again.");
    }
  }
  return <main><h1>Share feedback</h1>{sent ? <p>Thank you for your feedback.</p> : <form onSubmit={submit}><label>Describe your experience<textarea name="experience" maxLength={10000} rows={5} /></label><label>Suggestions<textarea name="suggestions" maxLength={10000} rows={5} /></label>{error && <p role="alert">{error}</p>}<button type="submit">Submit feedback</button></form>}</main>;
}
