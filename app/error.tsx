"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Something went wrong</p>
        <h1>Unable to load this page</h1>
        <p>Please retry. If the problem continues, sign out and log in again.</p>
        <button type="button" className="primary-button" onClick={reset}>
          Retry
        </button>
      </section>
    </main>
  );
}
