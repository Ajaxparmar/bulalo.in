import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const { paymentId } = await request.json() as { paymentId?: string };

  if (!user || !paymentId) {
    return NextResponse.json({ error: "Please login to continue" }, { status: 401 });
  }

  const [payment, settings] = await Promise.all([
    prisma.payment.findFirst({
      where: { id: paymentId, userId: user.id },
      include: { business: true, plan: true },
    }),
    prisma.siteSetting.findMany({
      where: { key: { in: ["razorpay_key_id", "razorpay_key_secret"] } },
    }),
  ]);

  if (!payment || !payment.business || !payment.plan || payment.status === "CAPTURED") {
    return NextResponse.json({ error: "This payment is not available" }, { status: 404 });
  }

  const keyId = settings.find((setting) => setting.key === "razorpay_key_id")?.value;
  const keySecret = settings.find((setting) => setting.key === "razorpay_key_secret")?.value;

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Payment gateway is not configured yet" }, { status: 503 });
  }

  if (payment.razorpayOrderId.startsWith("order_")) {
    return NextResponse.json({
      keyId,
      orderId: payment.razorpayOrderId,
      amount: payment.amountPaise,
      currency: payment.currency,
      businessName: payment.business.name,
      ownerName: user.name,
      ownerEmail: user.email,
      ownerPhone: user.phone,
      planName: payment.plan.name,
    });
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: payment.amountPaise,
      currency: payment.currency,
      receipt: `reg_${payment.id}`,
      notes: {
        paymentId: payment.id,
        businessId: payment.businessId,
        planId: payment.planId,
      },
    }),
  });
  const order = await response.json() as { id?: string; error?: { description?: string } };

  if (!response.ok || !order.id) {
    return NextResponse.json(
      { error: order.error?.description || "Unable to create payment order" },
      { status: 502 },
    );
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      razorpayOrderId: order.id,
      status: "CREATED",
      rawResponse: order,
    },
  });

  return NextResponse.json({
    keyId,
    orderId: order.id,
    amount: payment.amountPaise,
    currency: payment.currency,
    businessName: payment.business.name,
    ownerName: user.name,
    ownerEmail: user.email,
    ownerPhone: user.phone,
    planName: payment.plan.name,
  });
}
