import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">Account access</p>
          <h1>Login</h1>
        </div>

        {params.error ? <p className="form-error">{params.error}</p> : null}

        <form action="/api/login" method="post" className="stack-form">
          <label>
            Phone number
            <input name="phone" type="tel" required placeholder="9876543210" />
          </label>
          <label>
            Password
            <input name="password" type="password" required minLength={6} />
          </label>
          <button type="submit" className="primary-button">
            Login
          </button>
        </form>

        <p className="muted-link">
          New business owner? <Link href="/register">Register your shop</Link>
        </p>
      </section>
    </main>
  );
}
