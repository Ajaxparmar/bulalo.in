import Link from "next/link";
import { requireAdmin } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import {
  createCategoryAction,
  createSubcategoryAction,
  saveRazorpaySettingsAction,
  updatePaymentStatusAction,
} from "@/app/admin/actions";

const paymentStatuses = ["CREATED", "AUTHORIZED", "CAPTURED", "FAILED", "REFUNDED"];

function settingValue(settings: { key: string; value: string }[], key: string, fallback = "") {
  return settings.find((setting) => setting.key === key)?.value ?? fallback;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  await requireAdmin();

  const [params, categories, payments, users, settings] = await Promise.all([
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
  ]);

  return (
    <main className="portal-page">
      <div className="portal-header">
        <div>
          <p className="eyebrow">Admin console</p>
          <h1>Business directory control</h1>
        </div>
        <Link href="/logout" className="secondary-button">
          Logout
        </Link>
      </div>

      {params.error ? <p className="form-error">{params.error}</p> : null}
      {params.success ? <p className="form-success">{params.success}</p> : null}

      <section className="admin-grid">
        <div className="data-panel">
          <h2>Add main category</h2>
          <form action={createCategoryAction} className="stack-form compact">
            <label>
              Category name
              <input name="name" required />
            </label>
            <label>
              Image URL
              <input name="imageUrl" type="url" required placeholder="https://..." />
            </label>
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

        <div className="data-panel">
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
              Image URL
              <input name="imageUrl" type="url" required placeholder="https://..." />
            </label>
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
            <button type="submit" className="primary-button">Add subcategory</button>
          </form>
        </div>
      </section>

      <section className="data-panel">
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

      <section className="data-panel">
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

      <section className="data-panel">
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

      <section className="data-panel">
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
    </main>
  );
}
