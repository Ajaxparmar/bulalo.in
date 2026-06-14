"use server";

import { redirect } from "next/navigation";
import { createSession, verifyPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function loginAction(formData: FormData) {
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    redirect("/login?error=Invalid%20phone%20number%20or%20password");
  }

  await createSession(user.id);

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const pendingPayment = await prisma.payment.findFirst({
    where: {
      userId: user.id,
      status: { in: ["CREATED", "AUTHORIZED", "FAILED"] },
      business: { is: { status: "PENDING_PAYMENT" } },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  redirect(pendingPayment ? `/register/payment/${pendingPayment.id}` : "/dashboard");
}
