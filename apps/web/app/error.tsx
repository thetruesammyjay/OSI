"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep the production boundary observable without exposing internal details to learners.
    console.error(error);
  }, [error]);

  return (
    <main className="page error-page">
      <p className="eyebrow">Something interrupted the journey</p>
      <h1>We lost the signal.</h1>
      <p className="lede">Try the page again, or return to the learning path while the connection recovers.</p>
      <div className="hero-actions">
        <button className="button button-primary" type="button" onClick={() => reset()}>Try again</button>
        <Link className="button button-ghost" href="/">Return home</Link>
      </div>
    </main>
  );
}
