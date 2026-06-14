import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { completeRegistrationPayment } from "@/app/lib/payments";
import { prisma } from "@/app/lib/prisma";

type RazorpayWebhook = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        method?: string;
      };
    };
  };
};

export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature");
  const body = await request.text();
  const webhookSecret = await prisma.siteSetting.findUnique({
    where: { key: "razorpay_webhook_secret" },
  });

  if (!signature || !webhookSecret?.value) {
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 400 });
  }

  const expected = createHmac("sha256", webhookSecret.value).update(body).digest("hex");
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    receivedBuffer.length !== expectedBuffer.length
    || !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const event = JSON.parse(body) as RazorpayWebhook;
  const entity = event.payload?.payment?.entity;

  if (event.event === "payment.captured" && entity?.order_id && entity.id) {
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: entity.order_id },
    });

    if (payment?.planId) {
      await completeRegistrationPayment(payment.id, {
        razorpayPaymentId: entity.id,
        rawResponse: event,
      });

      if (entity.method) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { razorpayMethod: entity.method },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
