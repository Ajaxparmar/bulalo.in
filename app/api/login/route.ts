import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/app/lib/auth";
import { phoneLookupCandidates } from "@/app/lib/phone";
import { prisma } from "@/app/lib/prisma";

function redirectTo(path: string) {
  return new NextResponse(null, {
    status: 303,
    headers: { Location: path },
  });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findFirst({
    where: { phone: { in: phoneLookupCandidates(phone) } },
  });

  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    return redirectTo("/login?error=Invalid%20phone%20number%20or%20password");
  }

  await createSession(user.id);

  if (user.role === "ADMIN") {
    return redirectTo("/admin");
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

  const destination = pendingPayment
    ? `/register/payment/${pendingPayment.id}`
    : "/dashboard";

  return redirectTo(destination);
}
