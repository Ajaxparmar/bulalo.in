import Link from "next/link";
import { requireAdmin } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import {
  createCategoryAction,
  createSubcategoryAction,
  saveRazorpaySettingsAction,
  updatePaymentStatusAction,
} from "@/app/admin/actions";
import ImageUploadField from "@/app/admin/ImageUploadField";

const paymentStatuses = ["CREATED", "AUTHORIZED", "CAPTURED", "FAILED", "REFUNDED"];
const adminViews = ["overview", "businesses", "users", "payments", "categories", "settings"] as const;
type AdminView = (typeof adminViews)[number];

const viewDetails: Record<AdminView, { title: string; description: string }> = {
  overview: { title: "Dashboard overview", description: "Here is what is happening with Bulalo.in today." },
  businesses: { title: "Businesses", description: "Review enrolled businesses and their current status." },
  users: { title: "Enrolled users", description: "View registered shop owners and their activity." },
  payments: { title: "Payments", description: "Track income and update payment statuses." },
  categories: { title: "Categories", description: "Create and manage directory categories." },
  settings: { title: "Settings", description: "Manage Razorpay and registration fee settings." },
};

function settingValue(settings: { key: string; value: string }[], key: string, fallback = "") {
  return settings.find((setting) => setting.key === key)?.value ?? fallback;
}

function formatCurrency(amountPaise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amountPaise / 100);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; view?: string }>;
}) {
  const admin = await requireAdmin();

  const [params, categories, payments, users, settings, businesses] = await Promise.all([
    searchParams,
    prisma.mainCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        subcategories: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        business: true,
      },
    }),
    prisma.user.findMany({
      where: { role: "SHOP_OWNER" },
      orderBy: { createdAt: "desc" },
      include: {
        businesses: true,
        payments: true,
      },
    }),
    prisma.siteSetting.findMany(),
    prisma.business.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        city: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const totalIncomePaise = payments
    .filter((payment) => payment.status === "CAPTURED")
    .reduce((total, payment) => total + payment.amountPaise, 0);
  const activeBusinesses = businesses.filter((business) => business.status === "ACTIVE").length;
  const pendingBusinesses = businesses.filter((business) =>
    ["PENDING_PAYMENT", "PENDING_REVIEW"].includes(business.status),
  ).length;
  const capturedPayments = payments.filter((payment) => payment.status === "CAPTURED").length;
  const totalSubcategories = categories.reduce(
    (total, category) => total + category.subcategories.length,
    0,
  );
  const activeView: AdminView = adminViews.includes(params.view as AdminView)
    ? params.view as AdminView
    : "overview";

  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-sidebar-brand">
          <span>BULA</span>LO.IN
        </Link>
        <div className="admin-profile">
          <div className="admin-avatar">{(admin.name || "A").slice(0, 1).toUpperCase()}</div>
          <div>
            <strong>{admin.name || "Administrator"}</strong>
            <span>Admin account</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav" aria-label="Admin dashboard navigation">
          <Link href="/admin?view=overview" className={activeView === "overview" ? "active" : ""}><i className="fas fa-th-large" /> Overview</Link>
          <Link href="/admin?view=businesses" className={activeView === "businesses" ? "active" : ""}><i className="fas fa-store" /> Businesses</Link>
          <Link href="/admin?view=users" className={activeView === "users" ? "active" : ""}><i className="fas fa-users" /> Enrolled users</Link>
          <Link href="/admin?view=payments" className={activeView === "payments" ? "active" : ""}><i className="fas fa-wallet" /> Payments</Link>
          <Link href="/admin?view=categories" className={activeView === "categories" ? "active" : ""}><i className="fas fa-layer-group" /> Categories</Link>
          <Link href="/admin?view=settings" className={activeView === "settings" ? "active" : ""}><i className="fas fa-cog" /> Settings</Link>
        </nav>

        <Link href="/logout" className="admin-sidebar-logout">
          <i className="fas fa-sign-out-alt" /> Logout
        </Link>
      </aside>

      <div className="admin-dashboard-content">
        <header className="admin-dashboard-header">
          <div>
            <p>Admin dashboard</p>
            <h1>{viewDetails[activeView].title}</h1>
            <span>{viewDetails[activeView].description}</span>
          </div>
          <Link href="/" className="admin-view-site"><i className="fas fa-external-link-alt" /> View website</Link>
        </header>

        {params.error ? <p className="form-error">{params.error}</p> : null}
        {params.success ? <p className="form-success">{params.success}</p> : null}

        {activeView === "overview" ? (
          <>
          <section className="admin-stat-grid" aria-label="Dashboard overview">
          <article className="admin-stat-card">
            <div className="admin-stat-icon income"><i className="fas fa-rupee-sign" /></div>
            <span>Total income</span>
            <strong>{formatCurrency(totalIncomePaise)}</strong>
            <small>{capturedPayments} successful payments</small>
          </article>
          <article className="admin-stat-card">
            <div className="admin-stat-icon business"><i className="fas fa-store" /></div>
            <span>Businesses enrolled</span>
            <strong>{businesses.length}</strong>
            <small>{activeBusinesses} active businesses</small>
          </article>
          <article className="admin-stat-card">
            <div className="admin-stat-icon user"><i className="fas fa-users" /></div>
            <span>Shop owners</span>
            <strong>{users.length}</strong>
            <small>Registered owner accounts</small>
          </article>
          <article className="admin-stat-card">
            <div className="admin-stat-icon pending"><i className="fas fa-clock" /></div>
            <span>Pending approval</span>
            <strong>{pendingBusinesses}</strong>
            <small>Payment or review pending</small>
          </article>
          <article className="admin-stat-card">
            <div className="admin-stat-icon category"><i className="fas fa-layer-group" /></div>
            <span>Total categories</span>
            <strong>{categories.length}</strong>
            <small>Main service categories</small>
          </article>
          <article className="admin-stat-card">
            <div className="admin-stat-icon subcategory"><i className="fas fa-sitemap" /></div>
            <span>Total subcategories</span>
            <strong>{totalSubcategories}</strong>
            <small>Services inside categories</small>
          </article>
          </section>

          <section className="admin-overview-grid">
          <div className="admin-white-panel">
            <div className="admin-section-heading">
              <div>
                <span>Business activity</span>
                <h2>Recently enrolled businesses</h2>
              </div>
              <strong>{businesses.length} total</strong>
            </div>
            <div className="admin-business-list">
              {businesses.slice(0, 6).map((business) => (
                <div key={business.id}>
                  <span className="admin-business-mark">{business.name.slice(0, 1)}</span>
                  <div>
                    <strong>{business.name}</strong>
                    <small>{business.city} · {business.createdAt.toLocaleDateString("en-IN")}</small>
                  </div>
                  <span className={`admin-status ${business.status.toLowerCase()}`}>
                    {business.status.replaceAll("_", " ")}
                  </span>
                </div>
              ))}
              {businesses.length === 0 ? <p className="empty-state">No businesses enrolled yet.</p> : null}
            </div>
          </div>

          <div className="admin-white-panel">
            <div className="admin-section-heading">
              <div>
                <span>Directory health</span>
                <h2>Business status</h2>
              </div>
            </div>
            <div className="admin-status-summary">
              <div><span>Active</span><strong>{activeBusinesses}</strong></div>
              <div><span>Pending</span><strong>{pendingBusinesses}</strong></div>
              <div><span>Suspended</span><strong>{businesses.filter((item) => item.status === "SUSPENDED").length}</strong></div>
              <div><span>Rejected</span><strong>{businesses.filter((item) => item.status === "REJECTED").length}</strong></div>
            </div>
          </div>
          </section>
          </>
        ) : null}

        {activeView === "businesses" ? (
          <section className="admin-white-panel">
            <div className="admin-section-heading">
              <div>
                <span>All businesses</span>
                <h2>Enrolled business directory</h2>
              </div>
              <strong>{businesses.length} total</strong>
            </div>
            <div className="admin-business-list">
              {businesses.map((business) => (
                <div key={business.id}>
                  <span className="admin-business-mark">{business.name.slice(0, 1)}</span>
                  <div>
                    <strong>{business.name}</strong>
                    <small>{business.city} · Joined {business.createdAt.toLocaleDateString("en-IN")}</small>
                  </div>
                  <span className={`admin-status ${business.status.toLowerCase()}`}>
                    {business.status.replaceAll("_", " ")}
                  </span>
                </div>
              ))}
              {businesses.length === 0 ? <p className="empty-state">No businesses enrolled yet.</p> : null}
            </div>
          </section>
        ) : null}

        {activeView === "categories" ? (
          <>
        <section className="admin-stat-grid admin-category-stats" aria-label="Category overview">
          <article className="admin-stat-card">
            <div className="admin-stat-icon category"><i className="fas fa-layer-group" /></div>
            <span>Total categories</span>
            <strong>{categories.length}</strong>
            <small>Main service categories</small>
          </article>
          <article className="admin-stat-card">
            <div className="admin-stat-icon subcategory"><i className="fas fa-sitemap" /></div>
            <span>Total subcategories</span>
            <strong>{totalSubcategories}</strong>
            <small>Services inside categories</small>
          </article>
        </section>
        <section className="admin-grid">
          <div className="admin-white-panel">
          <h2>Add main category</h2>
          <form action={createCategoryAction} className="stack-form compact">
            <label>
              Category name
              <input name="name" required />
            </label>
            <ImageUploadField label="Upload image" />
            <label>
              Image alt text
              <input name="imageAlt" />
            </label>
            <label>
              Sort order
              <input name="sortOrder" type="number" defaultValue={0} />
            </label>
            <label>
              Description
              <textarea name="description" rows={3} />
            </label>
            <button type="submit" className="primary-button">Add category</button>
          </form>
          </div>

          <div className="admin-white-panel">
          <h2>Add subcategory</h2>
          <form action={createSubcategoryAction} className="stack-form compact">
            <label>
              Main category
              <select name="mainCategoryId" required>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              Subcategory name
              <input name="name" required />
            </label>
            <label>
              Sort order
              <input name="sortOrder" type="number" defaultValue={0} />
            </label>
            <label>
              Description
              <textarea name="description" rows={3} />
            </label>
            <button type="submit" className="primary-button">Add subcategory</button>
          </form>
          </div>
        </section>

        <section className="admin-white-panel">
        <h2>Categories</h2>
        <div className="category-list">
          {categories.map((category) => (
            <article key={category.id}>
              <img src={category.imageUrl} alt={category.imageAlt || category.name} />
              <div>
                <h3>{category.name}</h3>
                <p>{category.subcategories.length} subcategories</p>
                <p className="muted">{category.subcategories.map((item) => item.name).join(", ") || "No subcategories yet"}</p>
              </div>
            </article>
          ))}
        </div>
        </section>
          </>
        ) : null}

        {activeView === "settings" ? (
        <section className="admin-white-panel">
        <h2>Razorpay settings</h2>
        <form action={saveRazorpaySettingsAction} className="form-grid">
          <label>
            Key ID
            <input name="razorpay_key_id" defaultValue={settingValue(settings, "razorpay_key_id")} />
          </label>
          <label>
            Key Secret
            <input name="razorpay_key_secret" type="password" defaultValue={settingValue(settings, "razorpay_key_secret")} />
          </label>
          <label>
            Webhook Secret
            <input name="razorpay_webhook_secret" type="password" defaultValue={settingValue(settings, "razorpay_webhook_secret")} />
          </label>
          <label>
            Registration Fee Paise
            <input name="registration_fee_paise" type="number" defaultValue={settingValue(settings, "registration_fee_paise", "30000")} />
          </label>
          <button type="submit" className="primary-button">Save settings</button>
        </form>
        </section>
        ) : null}

        {activeView === "users" ? (
        <section className="admin-white-panel">
        <h2>Enrolled users</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Owner</th>
                <th>Phone</th>
                <th>Shops</th>
                <th>Payments</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name || "Owner"}</td>
                  <td>{user.phone}</td>
                  <td>{user.businesses.length}</td>
                  <td>{user.payments.length}</td>
                  <td>{user.createdAt.toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </section>
        ) : null}

        {activeView === "payments" ? (
          <>
          <section className="admin-stat-grid admin-payment-stats" aria-label="Payment overview">
            <article className="admin-stat-card">
              <div className="admin-stat-icon income"><i className="fas fa-rupee-sign" /></div>
              <span>Total captured income</span>
              <strong>{formatCurrency(totalIncomePaise)}</strong>
              <small>{capturedPayments} successful payments</small>
            </article>
            <article className="admin-stat-card">
              <div className="admin-stat-icon pending"><i className="fas fa-clock" /></div>
              <span>Pending payments</span>
              <strong>{payments.filter((payment) => ["CREATED", "AUTHORIZED"].includes(payment.status)).length}</strong>
              <small>Awaiting completion</small>
            </article>
          </section>
        <section className="admin-white-panel">
        <h2>Payment table</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Owner</th>
                <th>Business</th>
                <th>Amount</th>
                <th>Razorpay Order</th>
                <th>Payment ID</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.user.name || payment.user.phone}</td>
                  <td>{payment.business?.name || "No business"}</td>
                  <td>₹{payment.amountPaise / 100}</td>
                  <td>{payment.razorpayOrderId}</td>
                  <td>{payment.razorpayPaymentId || "-"}</td>
                  <td>{payment.status}</td>
                  <td>
                    <form action={updatePaymentStatusAction} className="inline-form">
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <select name="status" defaultValue={payment.status}>
                        {paymentStatuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <button type="submit">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
