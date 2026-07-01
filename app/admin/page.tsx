import Link from "next/link";
import { requireAdmin } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import {
  assignPlanAction,
  addFooterPopularCategoryAction,
  createCategoryAction,
  createHomepageBannerAction,
  createHomepageCardAction,
  createHomepageTopCardAction,
  createPlanAction,
  deleteBusinessAction,
  deleteCategoryAction,
  deleteHomepageBannerAction,
  deleteHomepageCardAction,
  deleteHomepageTopCardAction,
  deleteFooterPopularCategoryAction,
  deletePaymentAction,
  deletePlanAction,
  deleteSubscriptionAction,
  deleteUserAction,
  saveRazorpaySettingsAction,
  saveContentPagesAction,
  updateCategoryAction,
  updateHomepageBannerAction,
  updateHomepageCardAction,
  updateHomepageTopCardAction,
  updateFooterPopularCategoryAction,
  updatePaymentStatusAction,
  updatePlanAction,
  updateSubscriptionAction,
  updateUserAction,
} from "@/app/admin/actions";
import ConfirmSubmitButton from "@/app/admin/ConfirmSubmitButton";
import AdminActionConfirm from "@/app/admin/AdminActionConfirm";
import ImageUploadField from "@/app/admin/ImageUploadField";
import AdminBusinessEditModal from "@/app/admin/AdminBusinessEditModal";

export const dynamic = "force-dynamic";

const paymentStatuses = ["CREATED", "AUTHORIZED", "CAPTURED", "FAILED", "REFUNDED"];
const adminViews = ["overview", "homepage", "pages", "businesses", "users", "payments", "plans", "categories", "settings"] as const;
type AdminView = (typeof adminViews)[number];

const viewDetails: Record<AdminView, { title: string; description: string }> = {
  overview: { title: "Dashboard overview", description: "Here is what is happening with Bulalo.in today." },
  homepage: { title: "Homepage content", description: "Manage the clickable cards shown at the bottom of the homepage." },
  pages: { title: "Pages & footer", description: "Manage popular categories and About and Contact page content." },
  businesses: { title: "Businesses", description: "Review enrolled businesses and their current status." },
  users: { title: "Enrolled users", description: "View registered shop owners and their activity." },
  payments: { title: "Payments", description: "Track income and update payment statuses." },
  plans: { title: "Subscription plans", description: "Create plans and track active or expired subscriptions." },
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

  const [params, categories, payments, users, settings, businesses, plans, subscriptions, homepageCards, homepageTopCards, homepageBanners, footerPopularCategories] = await Promise.all([
    searchParams,
    prisma.mainCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
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
        phone: true,
        whatsapp: true,
        email: true,
        website: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        description: true,
        logoUrl: true,
        coverUrl: true,
        status: true,
        isTopListing: true,
        createdAt: true,
      },
    }),
    prisma.subscriptionPlan.findMany({
      orderBy: [{ durationMonths: "asc" }, { createdAt: "desc" }],
    }),
    prisma.businessSubscription.findMany({
      orderBy: { expiresAt: "desc" },
      include: {
        business: { include: { owner: true } },
        plan: true,
      },
    }),
    prisma.homepageCard.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { mainCategory: true },
    }),
    prisma.homepageTopCard.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { mainCategory: true },
    }),
    prisma.homepageBanner.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { mainCategory: true },
    }),
    prisma.footerPopularCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { mainCategory: true },
    }),
  ]);

  const now = new Date();
  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.startsAt <= now && subscription.expiresAt > now,
  );
  const expiredSubscriptions = subscriptions.filter((subscription) => subscription.expiresAt <= now);
  const upcomingSubscriptions = subscriptions.filter((subscription) => subscription.startsAt > now);
  const totalIncomePaise = payments
    .filter((payment) => payment.status === "CAPTURED")
    .reduce((total, payment) => total + payment.amountPaise, 0);
  const activeBusinesses = businesses.filter((business) => business.status === "ACTIVE").length;
  const pendingBusinesses = businesses.filter((business) =>
    ["PENDING_PAYMENT", "PENDING_REVIEW"].includes(business.status),
  ).length;
  const capturedPayments = payments.filter((payment) => payment.status === "CAPTURED").length;
  const activeView: AdminView = adminViews.includes(params.view as AdminView)
    ? params.view as AdminView
    : "overview";

  return (
    <main className="admin-dashboard">
      <AdminActionConfirm />
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
          <Link href="/admin?view=homepage" className={activeView === "homepage" ? "active" : ""}><i className="fas fa-images" /> Homepage</Link>
          <Link href="/admin?view=pages" className={activeView === "pages" ? "active" : ""}><i className="fas fa-file-alt" /> Pages & footer</Link>
          <Link href="/admin?view=businesses" className={activeView === "businesses" ? "active" : ""}><i className="fas fa-store" /> Businesses</Link>
          <Link href="/admin?view=users" className={activeView === "users" ? "active" : ""}><i className="fas fa-users" /> Enrolled users</Link>
          <Link href="/admin?view=payments" className={activeView === "payments" ? "active" : ""}><i className="fas fa-wallet" /> Payments</Link>
          <Link href="/admin?view=plans" className={activeView === "plans" ? "active" : ""}><i className="fas fa-calendar-alt" /> Plans</Link>
          <Link href="/admin?view=categories" className={activeView === "categories" ? "active" : ""}><i className="fas fa-layer-group" /> Categories</Link>
          <Link href="/admin?view=settings" className={activeView === "settings" ? "active" : ""}><i className="fas fa-cog" /> Settings</Link>
        </nav>

        <form action="/logout" method="post" className="admin-sidebar-logout-form">
          <button type="submit" className="admin-sidebar-logout">
            <i className="fas fa-sign-out-alt" /> Logout
          </button>
        </form>
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
            <div className="admin-stat-icon pending"><i className="fas fa-calendar-times" /></div>
            <span>Expired plans</span>
            <strong>{expiredSubscriptions.length}</strong>
            <small>Subscriptions requiring renewal</small>
          </article>
          <article className="admin-stat-card">
            <div className="admin-stat-icon category"><i className="fas fa-layer-group" /></div>
            <span>Total categories</span>
            <strong>{categories.length}</strong>
            <small>Main service categories</small>
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

        {activeView === "pages" ? (
          <>
            <section className="admin-grid">
              <div className="admin-white-panel">
                <h2>Add popular footer category</h2>
                <form action={addFooterPopularCategoryAction} className="stack-form compact">
                  <label>
                    Category
                    <select name="mainCategoryId" required>
                      <option value="">Select category</option>
                      {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                  </label>
                  <label>Sort order<input name="sortOrder" type="number" defaultValue={0} /></label>
                  <button type="submit" className="primary-button">Add popular category</button>
                </form>
              </div>

              <div className="admin-white-panel">
                <h2>Popular Categories</h2>
                <div className="admin-popular-list">
                  {footerPopularCategories.map((entry) => (
                    <div key={entry.id}>
                      <strong>{entry.mainCategory.name}</strong>
                      <form action={updateFooterPopularCategoryAction} className="inline-form">
                        <input type="hidden" name="entryId" value={entry.id} />
                        <input name="sortOrder" type="number" defaultValue={entry.sortOrder} aria-label="Sort order" />
                        <select name="isActive" defaultValue={String(entry.isActive)} aria-label="Status">
                          <option value="true">Active</option><option value="false">Inactive</option>
                        </select>
                        <button type="submit">Save</button>
                      </form>
                      <form action={deleteFooterPopularCategoryAction}>
                        <input type="hidden" name="entryId" value={entry.id} />
                        <ConfirmSubmitButton message={`Remove ${entry.mainCategory.name} from the footer?`}>Remove</ConfirmSubmitButton>
                      </form>
                    </div>
                  ))}
                  {footerPopularCategories.length === 0 ? <p className="empty-state">No popular footer categories selected.</p> : null}
                </div>
              </div>
            </section>

            <section className="admin-white-panel">
              <h2>About and Contact pages</h2>
              <form action={saveContentPagesAction} className="form-grid">
                <label className="full">
                  About page title
                  <input name="about_title" defaultValue={settingValue(settings, "about_title", "Helping people discover trusted local businesses")} />
                </label>
                <label className="full">
                  About page content
                  <textarea name="about_body" rows={8} defaultValue={settingValue(settings, "about_body")} />
                </label>
                <label className="full">
                  Contact page title
                  <input name="contact_title" defaultValue={settingValue(settings, "contact_title", "How can we help?")} />
                </label>
                <label className="full">
                  Contact page content
                  <textarea name="contact_body" rows={4} defaultValue={settingValue(settings, "contact_body")} />
                </label>
                <label>Contact phone<input name="contact_phone" defaultValue={settingValue(settings, "contact_phone", "+91 98128 66228")} /></label>
                <label>Contact email<input name="contact_email" type="email" defaultValue={settingValue(settings, "contact_email", "help@bulalo.in")} /></label>
                <label className="full">Contact address<textarea name="contact_address" rows={3} defaultValue={settingValue(settings, "contact_address", "Jind, Haryana, India")} /></label>
                <button type="submit" className="primary-button">Save pages</button>
              </form>
            </section>
          </>
        ) : null}

        {activeView === "homepage" ? (
          <>
            <section className="admin-grid">
              <div className="admin-white-panel">
                <h2>Add top header card</h2>
                <form action={createHomepageTopCardAction} className="stack-form compact">
                  <label>Card title<input name="title" required /></label>
                  <ImageUploadField label="Card image" />
                  <label>Image alt text<input name="imageAlt" /></label>
                  <label>
                    Belongs to category
                    <select name="mainCategoryId" required>
                      <option value="">Select category</option>
                      {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                  </label>
                  <label>Sort order<input name="sortOrder" type="number" defaultValue={0} /></label>
                  <button type="submit" className="primary-button">Add top card</button>
                </form>
              </div>

              <div className="admin-white-panel">
                <h2>Add top slider image</h2>
                <form action={createHomepageBannerAction} className="stack-form compact">
                  <label>Small heading<input name="eyebrow" placeholder="Featured banner" /></label>
                  <label>Title<input name="title" required /></label>
                  <label>Supporting text<input name="detail" /></label>
                  <ImageUploadField label="Slider image" />
                  <label>Image alt text<input name="imageAlt" /></label>
                  <label>
                    Belongs to category
                    <select name="mainCategoryId" required>
                      <option value="">Select category</option>
                      {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                  </label>
                  <label>Sort order<input name="sortOrder" type="number" defaultValue={0} /></label>
                  <button type="submit" className="primary-button">Add slider image</button>
                </form>
              </div>
            </section>

            <section className="admin-white-panel">
              <div className="admin-section-heading">
                <div><span>Maximum three shown</span><h2>Top header cards</h2></div>
                <strong>{homepageTopCards.length} total</strong>
              </div>
              <div className="admin-homepage-items">
                {homepageTopCards.map((card) => (
                  <article key={card.id} className="admin-homepage-item">
                    <img src={card.imageUrl} alt={card.imageAlt || card.title} />
                    <form id={`top-card-${card.id}`} action={updateHomepageTopCardAction} className="form-grid">
                      <input type="hidden" name="cardId" value={card.id} />
                      <label>Title<input name="title" defaultValue={card.title} required /></label>
                      <label>
                        Category
                        <select name="mainCategoryId" defaultValue={card.mainCategoryId} required>
                          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                        </select>
                      </label>
                      <label>Image alt<input name="imageAlt" defaultValue={card.imageAlt || ""} /></label>
                      <label>Sort order<input name="sortOrder" type="number" defaultValue={card.sortOrder} /></label>
                      <label>
                        Status
                        <select name="isActive" defaultValue={String(card.isActive)}>
                          <option value="true">Active</option><option value="false">Inactive</option>
                        </select>
                      </label>
                      <ImageUploadField label="Replace image" required={false} currentImageUrl={card.imageUrl} />
                    </form>
                    <div className="admin-row-actions">
                      <ConfirmSubmitButton className="" message={`Update ${card.title}?`} form={`top-card-${card.id}`}>Save</ConfirmSubmitButton>
                      <form action={deleteHomepageTopCardAction}>
                        <input type="hidden" name="cardId" value={card.id} />
                        <ConfirmSubmitButton message={`Delete ${card.title}?`}>Delete</ConfirmSubmitButton>
                      </form>
                    </div>
                  </article>
                ))}
                {homepageTopCards.length === 0 ? <p className="empty-state">The original three placeholder cards are currently shown.</p> : null}
              </div>
            </section>

            <section className="admin-white-panel">
              <div className="admin-section-heading">
                <div><span>Original slider design</span><h2>Top slider images</h2></div>
                <strong>{homepageBanners.length} total</strong>
              </div>
              <div className="admin-homepage-items">
                {homepageBanners.map((banner) => (
                  <article key={banner.id} className="admin-homepage-item">
                    <img src={banner.imageUrl} alt={banner.imageAlt || banner.title} />
                    <form id={`top-banner-${banner.id}`} action={updateHomepageBannerAction} className="form-grid">
                      <input type="hidden" name="bannerId" value={banner.id} />
                      <label>Small heading<input name="eyebrow" defaultValue={banner.eyebrow || ""} /></label>
                      <label>Title<input name="title" defaultValue={banner.title} required /></label>
                      <label>Supporting text<input name="detail" defaultValue={banner.detail || ""} /></label>
                      <label>
                        Category
                        <select name="mainCategoryId" defaultValue={banner.mainCategoryId} required>
                          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                        </select>
                      </label>
                      <label>Image alt<input name="imageAlt" defaultValue={banner.imageAlt || ""} /></label>
                      <label>Sort order<input name="sortOrder" type="number" defaultValue={banner.sortOrder} /></label>
                      <label>
                        Status
                        <select name="isActive" defaultValue={String(banner.isActive)}>
                          <option value="true">Active</option><option value="false">Inactive</option>
                        </select>
                      </label>
                      <ImageUploadField label="Replace image" required={false} currentImageUrl={banner.imageUrl} />
                    </form>
                    <div className="admin-row-actions">
                      <ConfirmSubmitButton className="" message={`Update ${banner.title}?`} form={`top-banner-${banner.id}`}>Save</ConfirmSubmitButton>
                      <form action={deleteHomepageBannerAction}>
                        <input type="hidden" name="bannerId" value={banner.id} />
                        <ConfirmSubmitButton message={`Delete ${banner.title}?`}>Delete</ConfirmSubmitButton>
                      </form>
                    </div>
                  </article>
                ))}
                {homepageBanners.length === 0 ? <p className="empty-state">The original placeholder slider is currently shown.</p> : null}
              </div>
            </section>

            <section className="admin-white-panel">
                <h2>Add bottom category card</h2>
                <form action={createHomepageCardAction} className="stack-form compact">
                  <label>
                    Card title
                    <input name="title" placeholder="Equipment" required />
                  </label>
                  <ImageUploadField label="Card image" />
                  <label>
                    Image alt text
                    <input name="imageAlt" placeholder="Equipment services" />
                  </label>
                  <label>
                    Belongs to category
                    <select name="mainCategoryId" required>
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    <small className="admin-field-help">Clicking the card will open this category.</small>
                  </label>
                  <label>
                    Sort order
                    <input name="sortOrder" type="number" defaultValue={0} />
                  </label>
                  <button type="submit" className="primary-button">Add card</button>
                </form>
            </section>

            <section className="admin-white-panel">
              <div className="admin-section-heading">
                <div>
                  <span>Bottom full-width section</span>
                  <h2>Category cards</h2>
                </div>
                <strong>{homepageCards.length} total</strong>
              </div>
              <div className="admin-homepage-items">
                {homepageCards.map((card) => (
                  <article key={card.id} className="admin-homepage-item">
                    <img src={card.imageUrl} alt={card.imageAlt || card.title} />
                    <form id={`homepage-card-${card.id}`} action={updateHomepageCardAction} className="form-grid">
                      <input type="hidden" name="cardId" value={card.id} />
                      <label>
                        Title
                        <input name="title" defaultValue={card.title} required />
                      </label>
                      <label>
                        Belongs to category
                        <select name="mainCategoryId" defaultValue={card.mainCategoryId || ""} required>
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Image alt
                        <input name="imageAlt" defaultValue={card.imageAlt || ""} />
                      </label>
                      <label>
                        Sort order
                        <input name="sortOrder" type="number" defaultValue={card.sortOrder} />
                      </label>
                      <label>
                        Status
                        <select name="isActive" defaultValue={String(card.isActive)}>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </label>
                      <ImageUploadField
                        label="Replace image"
                        required={false}
                        currentImageUrl={card.imageUrl}
                      />
                    </form>
                    <div className="admin-row-actions">
                      <ConfirmSubmitButton
                        className=""
                        message={`Update homepage card ${card.title}?`}
                        form={`homepage-card-${card.id}`}
                      >
                        Save
                      </ConfirmSubmitButton>
                      <form action={deleteHomepageCardAction}>
                        <input type="hidden" name="cardId" value={card.id} />
                        <ConfirmSubmitButton message={`Delete homepage card ${card.title}?`}>Delete</ConfirmSubmitButton>
                      </form>
                    </div>
                  </article>
                ))}
                {homepageCards.length === 0 ? <p className="empty-state">No custom cards yet. The homepage is showing its three placeholders.</p> : null}
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
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Name</th><th>Phone</th><th>City</th><th>Status</th><th>Top listing</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {businesses.map((business) => (
                    <tr key={business.id}>
                      <td>
                        <strong>{business.name}</strong>
                        <small className="admin-table-subtext">{business.address}</small>
                      </td>
                      <td>{business.phone}</td>
                      <td>{business.city}</td>
                      <td><span className="status-pill">{business.status.replaceAll("_", " ")}</span></td>
                      <td>{business.isTopListing ? "Featured" : "Standard"}</td>
                      <td>{business.createdAt.toLocaleDateString("en-IN")}</td>
                      <td>
                        <div className="admin-row-actions">
                          <AdminBusinessEditModal business={business} />
                          <form action={deleteBusinessAction}>
                            <input type="hidden" name="businessId" value={business.id} />
                            <ConfirmSubmitButton message={`Delete ${business.name} and all related records?`}>Delete</ConfirmSubmitButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {businesses.length === 0 ? <tr><td colSpan={7}>No businesses enrolled yet.</td></tr> : null}
                </tbody>
              </table>
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
        </section>
        <section className="admin-white-panel">
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
        </section>

        <section className="admin-white-panel">
        <h2>Categories</h2>
        <div className="category-list">
          {categories.map((category) => (
            <article key={category.id}>
              <img src={category.imageUrl} alt={category.imageAlt || category.name} />
              <div>
                <h3>{category.name}</h3>
                <p className="muted">{category.description || "Shop category"}</p>
              </div>
            </article>
          ))}
        </div>
        </section>

        <section className="admin-white-panel">
          <h2>Manage categories</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Sort</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td><input form={`category-${category.id}`} name="name" defaultValue={category.name} required /></td>
                    <td><input form={`category-${category.id}`} name="sortOrder" type="number" defaultValue={category.sortOrder} /></td>
                    <td>
                      <select form={`category-${category.id}`} name="isActive" defaultValue={String(category.isActive)}>
                        <option value="true">Active</option><option value="false">Inactive</option>
                      </select>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <form id={`category-${category.id}`} action={updateCategoryAction}>
                          <input type="hidden" name="categoryId" value={category.id} />
                          <ConfirmSubmitButton
                            className=""
                            message={`Update category ${category.name}?`}
                          >
                            Save
                          </ConfirmSubmitButton>
                        </form>
                        <form action={deleteCategoryAction}>
                          <input type="hidden" name="categoryId" value={category.id} />
                          <ConfirmSubmitButton message={`Delete category ${category.name}?`}>Delete</ConfirmSubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

        {activeView === "plans" ? (
          <>
            <section className="admin-stat-grid admin-plan-stats" aria-label="Subscription overview">
              <article className="admin-stat-card">
                <div className="admin-stat-icon category"><i className="fas fa-calendar-check" /></div>
                <span>Available plans</span>
                <strong>{plans.filter((plan) => plan.isActive).length}</strong>
                <small>Plans ready to assign</small>
              </article>
              <article className="admin-stat-card">
                <div className="admin-stat-icon income"><i className="fas fa-check-circle" /></div>
                <span>Active subscriptions</span>
                <strong>{activeSubscriptions.length}</strong>
                <small>Businesses currently covered</small>
              </article>
              <article className="admin-stat-card">
                <div className="admin-stat-icon user"><i className="fas fa-calendar-plus" /></div>
                <span>Upcoming subscriptions</span>
                <strong>{upcomingSubscriptions.length}</strong>
                <small>Scheduled to begin later</small>
              </article>
              <article className="admin-stat-card">
                <div className="admin-stat-icon pending"><i className="fas fa-calendar-times" /></div>
                <span>Expired subscriptions</span>
                <strong>{expiredSubscriptions.length}</strong>
                <small>Plans requiring renewal</small>
              </article>
            </section>

            <section className="admin-grid">
              <div className="admin-white-panel">
                <h2>Create plan</h2>
                <form action={createPlanAction} className="stack-form compact">
                  <label>
                    Plan name
                    <input name="name" placeholder="Example: 3 Month Plan" required />
                  </label>
                  <label>
                    Duration in months
                    <input name="durationMonths" type="number" min="1" defaultValue={1} required />
                  </label>
                  <label>
                    Price in rupees
                    <input name="priceRupees" type="number" min="0" step="0.01" required />
                  </label>
                  <button type="submit" className="primary-button">Create plan</button>
                </form>
              </div>

              <div className="admin-white-panel">
                <h2>Assign plan to business</h2>
                <form action={assignPlanAction} className="stack-form compact">
                  <label>
                    Business
                    <select name="businessId" required>
                      <option value="">Select business</option>
                      {businesses.map((business) => (
                        <option key={business.id} value={business.id}>{business.name} · {business.city}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Plan
                    <select name="planId" required>
                      <option value="">Select plan</option>
                      {plans.filter((plan) => plan.isActive).map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} · {plan.durationMonths} month{plan.durationMonths === 1 ? "" : "s"} · {formatCurrency(plan.pricePaise)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Start date
                    <input name="startsAt" type="date" defaultValue={now.toISOString().slice(0, 10)} required />
                  </label>
                  <button type="submit" className="primary-button">Assign plan</button>
                </form>
              </div>
            </section>

            <section className="admin-white-panel">
              <div className="admin-section-heading">
                <div>
                  <span>Plan catalogue</span>
                  <h2>Available plans</h2>
                </div>
                <strong>{plans.length} total</strong>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Plan</th><th>Duration</th><th>Price</th><th>Status</th><th>Created</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr key={plan.id}>
                        <td><input form={`plan-${plan.id}`} name="name" defaultValue={plan.name} required /></td>
                        <td><input form={`plan-${plan.id}`} name="durationMonths" type="number" min="1" defaultValue={plan.durationMonths} required /></td>
                        <td><input form={`plan-${plan.id}`} name="priceRupees" type="number" min="0" step="0.01" defaultValue={plan.pricePaise / 100} required /></td>
                        <td>
                          <select form={`plan-${plan.id}`} name="isActive" defaultValue={String(plan.isActive)}>
                            <option value="true">Active</option><option value="false">Inactive</option>
                          </select>
                        </td>
                        <td>{plan.createdAt.toLocaleDateString("en-IN")}</td>
                        <td>
                          <div className="admin-row-actions">
                            <form id={`plan-${plan.id}`} action={updatePlanAction}>
                              <input type="hidden" name="planId" value={plan.id} />
                              <ConfirmSubmitButton
                                className=""
                                message={`Update plan ${plan.name}?`}
                              >
                                Save
                              </ConfirmSubmitButton>
                            </form>
                            <form action={deletePlanAction}>
                              <input type="hidden" name="planId" value={plan.id} />
                              <ConfirmSubmitButton message={`Delete ${plan.name}? Plans with subscription history will be deactivated.`}>Delete</ConfirmSubmitButton>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {plans.length === 0 ? <tr><td colSpan={6}>No plans created yet.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="admin-white-panel">
              <div className="admin-section-heading">
                <div>
                  <span>Current coverage</span>
                  <h2>Active and upcoming subscriptions</h2>
                </div>
                <strong>{activeSubscriptions.length + upcomingSubscriptions.length} total</strong>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Business</th><th>Owner</th><th>Plan</th><th>Start date</th><th>Expiry date</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {[...upcomingSubscriptions, ...activeSubscriptions].map((subscription) => (
                      <tr key={subscription.id}>
                        <td>{subscription.business.name}</td>
                        <td>{subscription.business.owner.name || subscription.business.owner.phone}</td>
                        <td>
                          <select form={`subscription-${subscription.id}`} name="planId" defaultValue={subscription.planId}>
                            {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
                          </select>
                        </td>
                        <td><input form={`subscription-${subscription.id}`} name="startsAt" type="date" defaultValue={subscription.startsAt.toISOString().slice(0, 10)} /></td>
                        <td><input form={`subscription-${subscription.id}`} name="expiresAt" type="date" defaultValue={subscription.expiresAt.toISOString().slice(0, 10)} /></td>
                        <td>{subscription.startsAt > now ? "Upcoming" : "Active"}</td>
                        <td>
                          <div className="admin-row-actions">
                            <form id={`subscription-${subscription.id}`} action={updateSubscriptionAction}>
                              <input type="hidden" name="subscriptionId" value={subscription.id} />
                              <ConfirmSubmitButton
                                className=""
                                message={`Update ${subscription.plan.name} subscription for ${subscription.business.name}?`}
                              >
                                Save
                              </ConfirmSubmitButton>
                            </form>
                            <form action={deleteSubscriptionAction}>
                              <input type="hidden" name="subscriptionId" value={subscription.id} />
                              <ConfirmSubmitButton message={`Delete ${subscription.plan.name} subscription for ${subscription.business.name}?`}>Delete</ConfirmSubmitButton>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {activeSubscriptions.length + upcomingSubscriptions.length === 0 ? (
                      <tr><td colSpan={7}>No active or upcoming subscriptions.</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="admin-white-panel">
              <div className="admin-section-heading">
                <div>
                  <span>Renewal required</span>
                  <h2>Expired subscriptions</h2>
                </div>
                <strong>{expiredSubscriptions.length} expired</strong>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Business</th><th>Owner</th><th>Plan</th><th>Start date</th><th>Expired on</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {expiredSubscriptions.map((subscription) => (
                      <tr key={subscription.id}>
                        <td>{subscription.business.name}</td>
                        <td>{subscription.business.owner.name || subscription.business.owner.phone}</td>
                        <td>
                          <select form={`subscription-${subscription.id}`} name="planId" defaultValue={subscription.planId}>
                            {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
                          </select>
                        </td>
                        <td><input form={`subscription-${subscription.id}`} name="startsAt" type="date" defaultValue={subscription.startsAt.toISOString().slice(0, 10)} /></td>
                        <td><input form={`subscription-${subscription.id}`} name="expiresAt" type="date" defaultValue={subscription.expiresAt.toISOString().slice(0, 10)} /></td>
                        <td><span className="admin-status expired">Expired</span></td>
                        <td>
                          <div className="admin-row-actions">
                            <form id={`subscription-${subscription.id}`} action={updateSubscriptionAction}>
                              <input type="hidden" name="subscriptionId" value={subscription.id} />
                              <ConfirmSubmitButton
                                className=""
                                message={`Update expired subscription for ${subscription.business.name}?`}
                              >
                                Save
                              </ConfirmSubmitButton>
                            </form>
                            <form action={deleteSubscriptionAction}>
                              <input type="hidden" name="subscriptionId" value={subscription.id} />
                              <ConfirmSubmitButton message={`Delete expired subscription for ${subscription.business.name}?`}>Delete</ConfirmSubmitButton>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {expiredSubscriptions.length === 0 ? <tr><td colSpan={7}>No expired subscriptions.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </section>
          </>
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
                <th>Email</th>
                <th>Status</th>
                <th>Shops</th>
                <th>Payments</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td><input form={`user-${user.id}`} name="name" defaultValue={user.name || ""} /></td>
                  <td><input form={`user-${user.id}`} name="phone" defaultValue={user.phone} required /></td>
                  <td><input form={`user-${user.id}`} name="email" type="email" defaultValue={user.email || ""} /></td>
                  <td>
                    <select form={`user-${user.id}`} name="isActive" defaultValue={String(user.isActive)}>
                      <option value="true">Active</option><option value="false">Inactive</option>
                    </select>
                  </td>
                  <td>{user.businesses.length}</td>
                  <td>{user.payments.length}</td>
                  <td>{user.createdAt.toLocaleDateString("en-IN")}</td>
                  <td>
                    <div className="admin-row-actions">
                      <form id={`user-${user.id}`} action={updateUserAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <ConfirmSubmitButton
                          className=""
                          message={`Update ${user.name || user.phone}?`}
                        >
                          Save
                        </ConfirmSubmitButton>
                      </form>
                      <form action={deleteUserAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <ConfirmSubmitButton message={`Delete ${user.name || user.phone}, all businesses, payments, and subscriptions?`}>Delete</ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
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
                <th>Delete</th>
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
                      <ConfirmSubmitButton
                        className=""
                        message={`Update payment ${payment.razorpayOrderId}?`}
                      >
                        Save
                      </ConfirmSubmitButton>
                    </form>
                  </td>
                  <td>
                    <form action={deletePaymentAction}>
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <ConfirmSubmitButton
                        message={`Delete payment ${payment.razorpayOrderId}? Captured payments cannot be deleted.`}
                        className="admin-delete-button"
                      >
                        Delete
                      </ConfirmSubmitButton>
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
