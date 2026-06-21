import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { completeRegistrationPayment } from "@/app/lib/payments";
import { prisma } from "@/app/lib/prisma";
import { getRazorpayCredentials } from "@/app/lib/razorpay";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Please login to continue" }, { status: 401 });
  }

  let body: {
    paymentId?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (
    !body.paymentId
    || !body.razorpay_order_id
    || !body.razorpay_payment_id
    || !body.razorpay_signature
  ) {
    return NextResponse.json({ error: "Missing payment verification fields" }, { status: 400 });
  }

  const payment = await prisma.payment.findFirst({
    where: { id: body.paymentId, userId: user.id },
  });

  if (!payment || payment.razorpayOrderId !== body.razorpay_order_id) {
    return NextResponse.json({ error: "Payment order does not match" }, { status: 400 });
  }

  let keySecret: string;

  try {
    ({ keySecret } = getRazorpayCredentials());
  } catch {
    return NextResponse.json({ error: "Payment gateway is not configured" }, { status: 500 });
  }

  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(body.razorpay_signature, "utf8");

  if (
    expectedBuffer.length !== receivedBuffer.length
    || !timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return NextResponse.json({ error: "Payment signature is invalid" }, { status: 400 });
  }

  await completeRegistrationPayment(payment.id, {
    razorpayPaymentId: body.razorpay_payment_id,
    razorpaySignature: body.razorpay_signature,
    rawResponse: body,
  });

  return NextResponse.json({ success: true });
}
