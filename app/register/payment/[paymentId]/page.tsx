import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import PaymentCheckout from "./PaymentCheckout";

export default async function RegistrationPaymentPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const [user, { paymentId }] = await Promise.all([requireUser(), params]);
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId: user.id },
    include: { business: true, plan: true },
  });

  if (!payment || !payment.business || !payment.plan) {
    redirect("/dashboard");
  }

  if (payment.status === "CAPTURED") {
    redirect("/register/success");
  }

  return (
    <main className="auth-page">
      <section className="auth-panel payment-panel">
        <div>
          <p className="eyebrow">Registration payment</p>
          <h1>Complete your registration</h1>
          <p className="muted">
            Your account and shop details are already saved. You can leave this page and continue payment after logging in.
          </p>
        </div>

        <div className="payment-summary">
          <div><span>Shop</span><strong>{payment.business.name}</strong></div>
          <div><span>Plan</span><strong>{payment.plan.name}</strong></div>
          <div><span>Duration</span><strong>{payment.plan.durationMonths} month{payment.plan.durationMonths === 1 ? "" : "s"}</strong></div>
          <div><span>Amount</span><strong>₹{payment.amountPaise / 100}</strong></div>
        </div>

        <PaymentCheckout paymentId={payment.id} />
        <Link href="/dashboard" className="secondary-button">Pay later and view saved account</Link>
      </section>
    </main>
  );
}
