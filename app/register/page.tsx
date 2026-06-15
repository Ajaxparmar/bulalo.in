import Link from "next/link";
import { registerOwnerAction } from "@/app/register/actions";
import { prisma } from "@/app/lib/prisma";
import RegistrationSelections from "@/app/register/RegistrationSelections";

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
          <RegistrationSelections plans={plans} categories={categories} />

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
