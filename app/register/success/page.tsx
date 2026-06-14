import Link from "next/link";
import { requireUser } from "@/app/lib/auth";

export default async function RegistrationSuccessPage() {
  await requireUser();

  return (
    <main className="auth-page">
      <section className="auth-panel payment-panel">
        <p className="eyebrow">Payment successful</p>
        <h1>Registration completed</h1>
        <p className="form-success">
          Your payment was verified and your subscription is active. Your business is now pending admin review.
        </p>
        <Link href="/dashboard" className="primary-button">Go to dashboard</Link>
      </section>
    </main>
  );
}
