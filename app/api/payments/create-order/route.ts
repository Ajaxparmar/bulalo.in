import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { getRazorpayClient, getRazorpayCredentials } from "@/app/lib/razorpay";

type RazorpayError = {
  statusCode?: number;
  error?: { description?: string };
  message?: string;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Please login to continue" }, { status: 401 });
  }

  let paymentId: string | undefined;

  try {
    ({ paymentId } = await request.json() as { paymentId?: string });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!paymentId) {
    return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
  }

  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId: user.id },
    include: { business: true, plan: true },
  });

  if (!payment || !payment.business || !payment.plan || payment.status === "CAPTURED") {
    return NextResponse.json({ error: "This payment is not available" }, { status: 404 });
  }

  if (!Number.isInteger(payment.amountPaise) || payment.amountPaise < 100) {
    return NextResponse.json(
      { error: "Payment amount must be at least 100 paise" },
      { status: 400 },
    );
  }

  try {
    const { keyId } = getRazorpayCredentials();

    if (payment.razorpayOrderId.startsWith("order_")) {
      return NextResponse.json({
        keyId,
        order_id: payment.razorpayOrderId,
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

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: payment.amountPaise,
      currency: payment.currency,
      receipt: `reg_${payment.id}`.slice(0, 40),
      notes: {
        paymentId: payment.id,
        businessId: payment.businessId || "",
        planId: payment.planId || "",
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpayOrderId: order.id,
        razorpayReceipt: order.receipt || payment.razorpayReceipt,
        status: "CREATED",
        rawResponse: JSON.parse(JSON.stringify(order)),
      },
    });

    return NextResponse.json({
      keyId,
      order_id: order.id,
      orderId: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      businessName: payment.business.name,
      ownerName: user.name,
      ownerEmail: user.email,
      ownerPhone: user.phone,
      planName: payment.plan.name,
    });
  } catch (error) {
    const razorpayError = error as RazorpayError;
    const status = razorpayError.statusCode === 401 ? 401 : 500;

    console.error("Razorpay order creation failed", error);

    return NextResponse.json(
      {
        error: status === 401
          ? "Razorpay authentication failed"
          : razorpayError.error?.description
            || razorpayError.message
            || "Unable to create payment order",
      },
      { status },
    );
  }
}
