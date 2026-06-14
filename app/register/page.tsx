import Link from "next/link";
import { registerOwnerAction } from "@/app/register/actions";
import { prisma } from "@/app/lib/prisma";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [params, categories, plans] = await Promise.all([
    searchParams,
    prisma.mainCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
    }),
    prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: [{ durationMonths: "asc" }, { pricePaise: "asc" }],
    }),
  ]);

  return (
    <main className="auth-page wide">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">Business enrollment</p>
          <h1>Register your shop</h1>
          <p className="muted">Choose a plan, save your shop details, and complete payment securely through Razorpay.</p>
        </div>

        {params.error ? <p className="form-error">{params.error}</p> : null}

        <form action={registerOwnerAction} className="stack-form">
          <div className="selection-box">
            <h2>Select your plan</h2>
            <p className="muted">Your account details are saved before payment, so you can return and continue later.</p>
            <div className="plan-choice-grid">
              {plans.map((plan) => (
                <label key={plan.id} className="plan-choice-card">
                  <input type="radio" name="planId" value={plan.id} required />
                  <strong>{plan.name}</strong>
                  <span>{plan.durationMonths} month{plan.durationMonths === 1 ? "" : "s"}</span>
                  <b>₹{plan.pricePaise / 100}</b>
                </label>
              ))}
            </div>
            {plans.length === 0 ? <p className="form-error">No registration plans are currently available.</p> : null}
          </div>

          <div className="form-grid">
            <label>
              Owner name
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
              <input name="password" type="password" required minLength={6} />
            </label>
            <label>
              Shop name
              <input name="businessName" required />
            </label>
            <label>
              Shop phone
              <input name="businessPhone" type="tel" required />
            </label>
            <label className="full">
              Address
              <textarea name="address" required rows={3} />
            </label>
            <label>
              City
              <input name="city" required />
            </label>
            <label>
              State
              <input name="state" required />
            </label>
            <label>
              Pincode
              <input name="pincode" required />
            </label>
          </div>

          <div className="selection-box">
            <h2>Main categories</h2>
            <p className="muted">Select 1 to 3.</p>
            <div className="checkbox-grid">
              {categories.map((category) => (
                <label key={category.id} className="check-card">
                  <input type="checkbox" name="categoryIds" value={category.id} />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="selection-box">
            <h2>Subcategories</h2>
            <p className="muted">Select 1 to 3 matching your main categories.</p>
            <div className="checkbox-grid">
              {categories.flatMap((category) =>
                category.subcategories.map((subcategory) => (
                  <label key={subcategory.id} className="check-card">
                    <input type="checkbox" name="subcategoryIds" value={subcategory.id} />
                    <span>{subcategory.name}</span>
                    <small>{category.name}</small>
                  </label>
                )),
              )}
            </div>
          </div>

          <button type="submit" className="primary-button">
            Save details and continue to payment
          </button>
        </form>

        <p className="muted-link">
          Already registered? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
