import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { completeRegistrationPayment } from "@/app/lib/payments";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const body = await request.json() as {
    paymentId?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };

  if (
    !user
    || !body.paymentId
    || !body.razorpay_order_id
    || !body.razorpay_payment_id
    || !body.razorpay_signature
  ) {
    return NextResponse.json({ error: "Invalid payment response" }, { status: 400 });
  }

  const [payment, secretSetting] = await Promise.all([
    prisma.payment.findFirst({
      where: { id: body.paymentId, userId: user.id },
    }),
    prisma.siteSetting.findUnique({ where: { key: "razorpay_key_secret" } }),
  ]);

  if (!payment || payment.razorpayOrderId !== body.razorpay_order_id || !secretSetting?.value) {
    return NextResponse.json({ error: "Payment could not be verified" }, { status: 400 });
  }

  const expected = createHmac("sha256", secretSetting.value)
    .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
    .digest("hex");
  const received = Buffer.from(body.razorpay_signature);
  const expectedBuffer = Buffer.from(expected);

  if (received.length !== expectedBuffer.length || !timingSafeEqual(received, expectedBuffer)) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", razorpayFailureReason: "Signature verification failed" },
    });
    return NextResponse.json({ error: "Payment signature is invalid" }, { status: 400 });
  }

  await completeRegistrationPayment(payment.id, {
    razorpayPaymentId: body.razorpay_payment_id,
    razorpaySignature: body.razorpay_signature,
    rawResponse: body,
  });

  return NextResponse.json({ success: true });
}
