import "server-only";

import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/app/lib/prisma";

export async function completeRegistrationPayment(
  paymentId: string,
  details: {
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    rawResponse?: Prisma.InputJsonValue;
  } = {},
) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { plan: true },
  });

  if (!payment || !payment.businessId || !payment.planId || !payment.plan) {
    throw new Error("Payment is missing its business or selected plan");
  }

  const capturedAt = payment.razorpayCapturedAt || new Date();

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "CAPTURED",
      razorpayCapturedAt: capturedAt,
      razorpayPaymentId: details.razorpayPaymentId || payment.razorpayPaymentId,
      razorpaySignature: details.razorpaySignature || payment.razorpaySignature,
      rawResponse: details.rawResponse || undefined,
    },
  });

  const existingSubscription = await prisma.businessSubscription.findFirst({
    where: { paymentId: payment.id },
    select: { id: true },
  });

  if (!existingSubscription) {
    const expiresAt = new Date(capturedAt);
    expiresAt.setMonth(expiresAt.getMonth() + payment.plan.durationMonths);

    await prisma.businessSubscription.create({
      data: {
        businessId: payment.businessId,
        planId: payment.planId,
        paymentId: payment.id,
        startsAt: capturedAt,
        expiresAt,
      },
    });
  }

  await prisma.business.update({
    where: { id: payment.businessId },
    data: { status: "PENDING_REVIEW" },
  });
}
