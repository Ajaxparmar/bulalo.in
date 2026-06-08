import Link from "next/link";
import { registerOwnerAction } from "@/app/register/actions";
import { prisma } from "@/app/lib/prisma";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [params, categories] = await Promise.all([
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
  ]);

  return (
    <main className="auth-page wide">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">Business enrollment</p>
          <h1>Register your shop</h1>
          <p className="muted">Registration fee: ₹300 via Razorpay.</p>
        </div>

        {params.error ? <p className="form-error">{params.error}</p> : null}

        <form action={registerOwnerAction} className="stack-form">
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
            Register and continue
          </button>
        </form>

        <p className="muted-link">
          Already registered? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
