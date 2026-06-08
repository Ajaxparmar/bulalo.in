"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { slugify, uniqueSlug } from "@/app/lib/slug";

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const imageAlt = String(formData.get("imageAlt") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const sortOrder = Number(formData.get("sortOrder") || 0);

  if (!name || !imageUrl) {
    redirect("/admin?error=Category%20name%20and%20image%20are%20required");
  }

  await prisma.mainCategory.create({
    data: {
      name,
      slug: uniqueSlug(name),
      imageUrl,
      imageAlt,
      description,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });

  revalidatePath("/admin");
  redirect("/admin?success=Category%20added");
}

export async function createSubcategoryAction(formData: FormData) {
  await requireAdmin();

  const mainCategoryId = String(formData.get("mainCategoryId") || "");
  const name = String(formData.get("name") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const imageAlt = String(formData.get("imageAlt") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const sortOrder = Number(formData.get("sortOrder") || 0);

  if (!mainCategoryId || !name || !imageUrl) {
    redirect("/admin?error=Subcategory%20name,%20parent%20category,%20and%20image%20are%20required");
  }

  await prisma.subcategory.create({
    data: {
      mainCategoryId,
      name,
      slug: `${slugify(name)}-${Date.now().toString(36)}`,
      imageUrl,
      imageAlt,
      description,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });

  revalidatePath("/admin");
  redirect("/admin?success=Subcategory%20added");
}

export async function saveRazorpaySettingsAction(formData: FormData) {
  await requireAdmin();

  const settings = [
    ["razorpay_key_id", "Razorpay Key ID", String(formData.get("razorpay_key_id") || "").trim(), false],
    ["razorpay_key_secret", "Razorpay Key Secret", String(formData.get("razorpay_key_secret") || "").trim(), true],
    ["razorpay_webhook_secret", "Razorpay Webhook Secret", String(formData.get("razorpay_webhook_secret") || "").trim(), true],
    ["registration_fee_paise", "Registration Fee Paise", String(formData.get("registration_fee_paise") || "30000").trim(), false],
  ] as const;

  await Promise.all(
    settings.map(([key, label, value, isSecret]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value, label, isSecret },
        create: { key, value, label, isSecret },
      }),
    ),
  );

  revalidatePath("/admin");
  redirect("/admin?success=Razorpay%20settings%20saved");
}

export async function updatePaymentStatusAction(formData: FormData) {
  await requireAdmin();

  const paymentId = String(formData.get("paymentId") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["CREATED", "AUTHORIZED", "CAPTURED", "FAILED", "REFUNDED"];

  if (!paymentId || !allowed.includes(status)) {
    redirect("/admin?error=Invalid%20payment%20status");
  }

  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: status as "CREATED" | "AUTHORIZED" | "CAPTURED" | "FAILED" | "REFUNDED",
      razorpayCapturedAt: status === "CAPTURED" ? new Date() : undefined,
    },
  });

  if (status === "CAPTURED" && payment.businessId) {
    await prisma.business.update({
      where: { id: payment.businessId },
      data: { status: "ACTIVE" },
    });
  }

  revalidatePath("/admin");
  redirect("/admin?success=Payment%20updated");
}
