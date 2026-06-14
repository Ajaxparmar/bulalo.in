"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { completeRegistrationPayment } from "@/app/lib/payments";
import { slugify, uniqueSlug } from "@/app/lib/slug";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const imageExtensions: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function saveUploadedImage(entry: FormDataEntryValue | null, folder: string) {
  if (!(entry instanceof File) || entry.size === 0) {
    throw new Error("Please select an image to upload");
  }

  const extension = imageExtensions[entry.type];

  if (!extension) {
    throw new Error("Only JPG, PNG, GIF, and WebP images are allowed");
  }

  if (entry.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be smaller than 5 MB");
  }

  const uploadDirectory = path.join(process.cwd(), "public", "uploads", folder);
  const filename = `${Date.now()}-${randomUUID()}.${extension}`;

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, filename), Buffer.from(await entry.arrayBuffer()));

  return `/uploads/${folder}/${filename}`;
}

function uploadErrorRedirect(error: unknown): never {
  const message = error instanceof Error ? error.message : "Image upload failed";
  redirect(`/admin?view=categories&error=${encodeURIComponent(message)}`);
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const imageAlt = String(formData.get("imageAlt") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const sortOrder = Number(formData.get("sortOrder") || 0);

  if (!name) {
    redirect("/admin?view=categories&error=Category%20name%20and%20image%20are%20required");
  }

  let imageUrl: string;

  try {
    imageUrl = await saveUploadedImage(formData.get("image"), "categories");
  } catch (error) {
    uploadErrorRedirect(error);
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
  redirect("/admin?view=categories&success=Category%20added");
}

export async function createSubcategoryAction(formData: FormData) {
  await requireAdmin();

  const mainCategoryId = String(formData.get("mainCategoryId") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const sortOrder = Number(formData.get("sortOrder") || 0);

  if (!mainCategoryId || !name) {
    redirect("/admin?view=categories&error=Subcategory%20name%20and%20parent%20category%20are%20required");
  }

  await prisma.subcategory.create({
    data: {
      mainCategoryId,
      name,
      slug: `${slugify(name)}-${Date.now().toString(36)}`,
      description,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });

  revalidatePath("/admin");
  redirect("/admin?view=categories&success=Subcategory%20added");
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
  redirect("/admin?view=settings&success=Razorpay%20settings%20saved");
}

export async function updatePaymentStatusAction(formData: FormData) {
  await requireAdmin();

  const paymentId = String(formData.get("paymentId") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["CREATED", "AUTHORIZED", "CAPTURED", "FAILED", "REFUNDED"];

  if (!paymentId || !allowed.includes(status)) {
    redirect("/admin?view=payments&error=Invalid%20payment%20status");
  }

  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: status as "CREATED" | "AUTHORIZED" | "CAPTURED" | "FAILED" | "REFUNDED",
      razorpayCapturedAt: status === "CAPTURED" ? new Date() : undefined,
    },
  });

  if (status === "CAPTURED" && payment.businessId) {
    if (payment.planId) {
      await completeRegistrationPayment(payment.id);
    } else {
      await prisma.business.update({
        where: { id: payment.businessId },
        data: { status: "ACTIVE" },
      });
    }
  }

  revalidatePath("/admin");
  redirect("/admin?view=payments&success=Payment%20updated");
}

export async function createPlanAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const durationMonths = Number(formData.get("durationMonths"));
  const priceRupees = Number(formData.get("priceRupees"));

  if (
    !name
    || !Number.isInteger(durationMonths)
    || durationMonths < 1
    || !Number.isFinite(priceRupees)
    || priceRupees < 0
  ) {
    redirect("/admin?view=plans&error=Enter%20a%20valid%20plan%20name%2C%20duration%2C%20and%20price");
  }

  await prisma.subscriptionPlan.create({
    data: {
      name,
      durationMonths,
      pricePaise: Math.round(priceRupees * 100),
    },
  });

  revalidatePath("/admin");
  redirect("/admin?view=plans&success=Plan%20created");
}

export async function assignPlanAction(formData: FormData) {
  await requireAdmin();

  const businessId = String(formData.get("businessId") || "");
  const planId = String(formData.get("planId") || "");
  const startsAtValue = String(formData.get("startsAt") || "");
  const startsAt = startsAtValue ? new Date(`${startsAtValue}T00:00:00`) : new Date();
  const plan = await prisma.subscriptionPlan.findFirst({
    where: { id: planId, isActive: true },
  });

  if (!businessId || !plan || Number.isNaN(startsAt.getTime())) {
    redirect("/admin?view=plans&error=Select%20a%20valid%20business%2C%20plan%2C%20and%20start%20date");
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true },
  });

  if (!business) {
    redirect("/admin?view=plans&error=Business%20not%20found");
  }

  const expiresAt = new Date(startsAt);
  expiresAt.setMonth(expiresAt.getMonth() + plan.durationMonths);

  await prisma.businessSubscription.create({
    data: {
      businessId,
      planId,
      startsAt,
      expiresAt,
    },
  });

  revalidatePath("/admin");
  redirect("/admin?view=plans&success=Plan%20assigned");
}
