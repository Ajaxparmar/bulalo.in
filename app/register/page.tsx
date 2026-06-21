import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import RegisterShopForm from "@/app/register/RegisterShopForm";

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

        <RegisterShopForm plans={plans} categories={categories} />

        <p className="muted-link">
          Already registered? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
