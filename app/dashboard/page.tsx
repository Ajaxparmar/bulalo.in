import Link from "next/link";
import { requireUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import ImageUploadField from "@/app/admin/ImageUploadField";
import { updateOwnerBusinessAction } from "@/app/dashboard/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireUser();
  const [params, businesses] = await Promise.all([
    searchParams,
    prisma.business.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        payments: { orderBy: { createdAt: "desc" } },
        subscriptions: {
          orderBy: { expiresAt: "desc" },
          include: { plan: true },
        },
        categories: { include: { mainCategory: true } },
        visits: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { visits: true } },
      },
    }),
  ]);

  return (
    <main className="portal-page">
      <div className="portal-header">
        <div>
          <p className="eyebrow">Owner dashboard</p>
          <h1>Welcome{user.name ? `, ${user.name}` : ""}</h1>
        </div>
        <form action="/logout" method="post">
          <button type="submit" className="secondary-button">Logout</button>
        </form>
      </div>

      <section className="data-panel">
        <h2>Your shops</h2>
        {params.success ? <p className="form-success">{params.success}</p> : null}
        {params.error ? <p className="form-error">{params.error}</p> : null}
        <div className="card-grid">
          {businesses.map((business) => (
            <article key={business.id} className="business-card">
              <div>
                <h3>{business.name}</h3>
                <p>{business.address}, {business.city}</p>
              </div>
              <span className="status-pill">{business.status.replaceAll("_", " ")}</span>
              <p className="muted">
                Category: {business.categories[0]?.mainCategory.name || "Not selected"}
              </p>
              <div className="visit-summary">
                <strong>{business._count.visits}</strong>
                <span>Total listing visits</span>
              </div>
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
              <details className="dashboard-details">
                <summary>Edit business details</summary>
                <form action={updateOwnerBusinessAction} className="stack-form compact">
                  <input type="hidden" name="businessId" value={business.id} />
                  <div className="form-grid">
                    <label>
                      Shop name
                      <input name="name" defaultValue={business.name} required />
                    </label>
                    <label>
                      Phone
                      <input name="phone" type="tel" defaultValue={business.phone} required />
                    </label>
                    <label>
                      WhatsApp
                      <input name="whatsapp" type="tel" defaultValue={business.whatsapp || ""} />
                    </label>
                    <label>
                      Email
                      <input name="email" type="email" defaultValue={business.email || ""} />
                    </label>
                    <label>
                      Website
                      <input name="website" type="url" defaultValue={business.website || ""} />
                    </label>
                    <label>
                      City
                      <input name="city" defaultValue={business.city} required />
                    </label>
                    <label>
                      State
                      <input name="state" defaultValue={business.state} required />
                    </label>
                    <label>
                      Pincode
                      <input name="pincode" defaultValue={business.pincode} required maxLength={6} />
                    </label>
                    <label className="full">
                      Address
                      <textarea name="address" defaultValue={business.address} required rows={3} />
                    </label>
                    <label className="full">
                      Description
                      <textarea name="description" defaultValue={business.description || ""} rows={4} />
                    </label>
                    <ImageUploadField label="Logo image" name="logo" required={false} currentImageUrl={business.logoUrl || ""} />
                    <ImageUploadField label="Cover image" name="cover" required={false} currentImageUrl={business.coverUrl || ""} />
                  </div>
                  <button type="submit" className="primary-button">Save business</button>
                </form>
              </details>
              <details className="dashboard-details">
                <summary>Recent visit log</summary>
                <div className="mini-table visit-log-table">
                  {business.visits.map((visit) => (
                    <div key={visit.id}>
                      <span>{visit.createdAt.toLocaleString("en-IN")}</span>
                      <span>{visit.ipAddress || "Unknown IP"}</span>
                      <span>{visit.referrer || "Direct visit"}</span>
                    </div>
                  ))}
                  {business.visits.length === 0 ? <p className="empty-state">No visits recorded yet.</p> : null}
                </div>
              </details>
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
