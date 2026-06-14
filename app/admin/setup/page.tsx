import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { createFirstAdminAction } from "@/app/admin/setup/actions";
import AdminActionConfirm from "@/app/admin/AdminActionConfirm";

export default async function AdminSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [params, adminCount] = await Promise.all([
    searchParams,
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  if (adminCount > 0) {
    redirect("/login");
  }

  return (
    <main className="auth-page admin-setup-page">
      <AdminActionConfirm />
      <section className="auth-panel">
        <div>
          <p className="eyebrow">First admin</p>
          <h1>Create admin account</h1>
          <p className="muted">This setup page is available only until the first admin exists.</p>
        </div>

        {params.error ? <p className="form-error">{params.error}</p> : null}

        <form action={createFirstAdminAction} className="stack-form">
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Phone number
            <input name="phone" type="tel" required />
          </label>
          <label>
            Email
            <input name="email" type="email" />
          </label>
          <label>
            Password
            <input name="password" type="password" required minLength={8} />
          </label>
          <button type="submit" className="primary-button">
            Create admin
          </button>
        </form>

        <p className="muted-link">
          Already have admin? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
