import Link from "next/link";
import { requireUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export default async function DashboardPage() {
  const user = await requireUser();
  const businesses = await prisma.business.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      payments: { orderBy: { createdAt: "desc" } },
      subscriptions: {
        orderBy: { expiresAt: "desc" },
        include: { plan: true },
      },
      categories: { include: { mainCategory: true } },
      subcategories: { include: { subcategory: true } },
    },
  });

  return (
    <main className="portal-page">
      <div className="portal-header">
        <div>
          <p className="eyebrow">Owner dashboard</p>
          <h1>Welcome{user.name ? `, ${user.name}` : ""}</h1>
        </div>
        <Link href="/logout" className="secondary-button">
          Logout
        </Link>
      </div>

      <section className="data-panel">
        <h2>Your shops</h2>
        <div className="card-grid">
          {businesses.map((business) => (
            <article key={business.id} className="business-card">
              <div>
                <h3>{business.name}</h3>
                <p>{business.address}, {business.city}</p>
              </div>
              <span className="status-pill">{business.status.replaceAll("_", " ")}</span>
              <p className="muted">
                Categories: {business.categories.map((item) => item.mainCategory.name).join(", ") || "Not selected"}
              </p>
              <p className="muted">
                Subcategories: {business.subcategories.map((item) => item.subcategory.name).join(", ") || "Not selected"}
              </p>
              {business.subscriptions[0] ? (
                <p className="muted">
                  Plan: {business.subscriptions[0].plan.name} · Expires {business.subscriptions[0].expiresAt.toLocaleDateString("en-IN")}
                </p>
              ) : null}
              {business.status === "PENDING_PAYMENT" ? (
                <div className="pending-payment-box">
                  <strong>Payment pending</strong>
                  <span>Your saved registration will remain available until you complete payment.</span>
                  {business.payments.find((payment) => payment.status !== "CAPTURED") ? (
                    <Link
                      href={`/register/payment/${business.payments.find((payment) => payment.status !== "CAPTURED")!.id}`}
                      className="primary-button"
                    >
                      Continue payment
                    </Link>
                  ) : null}
                </div>
              ) : null}
              <div className="mini-table">
                {business.payments.map((payment) => (
                  <div key={payment.id}>
                    <span>₹{payment.amountPaise / 100}</span>
                    <span>{payment.status}</span>
                    <span>{payment.razorpayOrderId}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
          {businesses.length === 0 ? (
            <p className="empty-state">No shop is registered with this account yet.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
