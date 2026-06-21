import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { getRazorpayCredentials } from "@/app/lib/razorpay";

type RazorpayOrder = {
  id?: string;
  amount?: number | string;
  currency?: string;
  receipt?: string | null;
  error?: { description?: string };
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
    const { keyId, keySecret } = getRazorpayCredentials();

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

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: payment.amountPaise,
        currency: payment.currency,
        receipt: `reg_${payment.id}`.slice(0, 40),
        notes: {
          paymentId: payment.id,
          businessId: payment.businessId || "",
          planId: payment.planId || "",
        },
      }),
    });
    const order = await response.json() as RazorpayOrder;

    if (!response.ok || !order.id) {
      return NextResponse.json(
        {
          error: response.status === 401
            ? "Razorpay authentication failed"
            : order.error?.description || "Unable to create payment order",
        },
        { status: response.status === 401 ? 401 : 500 },
      );
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpayOrderId: order.id,
        razorpayReceipt: order.receipt || payment.razorpayReceipt,
        status: "CREATED",
        rawResponse: order,
      },
    });

    return NextResponse.json({
      keyId,
      order_id: order.id,
      orderId: order.id,
      amount: Number(order.amount || payment.amountPaise),
      currency: order.currency || payment.currency,
      businessName: payment.business.name,
      ownerName: user.name,
      ownerEmail: user.email,
      ownerPhone: user.phone,
      planName: payment.plan.name,
    });
  } catch (error) {
    console.error("Razorpay order creation failed", error);

    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Unable to create payment order",
      },
      { status: 500 },
    );
  }
}
