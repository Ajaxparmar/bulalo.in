"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidIndianPhone, normalizePhone } from "@/app/lib/phone";
import { requireAdmin } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { completeRegistrationPayment } from "@/app/lib/payments";
import { uniqueSlug } from "@/app/lib/slug";
import { optionalUploadedImage, saveUploadedImage } from "@/app/lib/uploads";

function uploadErrorRedirect(error: unknown): never {
  const message = error instanceof Error ? error.message : "Image upload failed";
  redirect(`/admin?view=categories&error=${encodeURIComponent(message)}`);
}

function homepageErrorRedirect(error: unknown): never {
  const message = error instanceof Error ? error.message : "Homepage content could not be saved";
  adminRedirect("homepage", "error", message);
}

function adminRedirect(view: string, type: "success" | "error", message: string): never {
  redirect(`/admin?view=${view}&${type}=${encodeURIComponent(message)}`);
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

export async function updateUserAction(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") || "");
  const name = String(formData.get("name") || "").trim() || null;
  const phone = normalizePhone(String(formData.get("phone") || ""));
  const email = String(formData.get("email") || "").trim() || null;
  const isActive = String(formData.get("isActive")) === "true";

  if (!userId || !isValidIndianPhone(phone)) {
    adminRedirect("users", "error", "A valid 10-digit Indian phone number is required");
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name, phone, email, isActive },
    });
  } catch {
    adminRedirect("users", "error", "Unable to update user. The phone number may already be in use");
  }

  revalidatePath("/admin");
  adminRedirect("users", "success", "User updated");
}

export async function deleteUserAction(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") || "");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });

  if (!userId || !user || user.role === "ADMIN") {
    adminRedirect("users", "error", "This user cannot be deleted");
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin");
  adminRedirect("users", "success", "User and related businesses deleted");
}

export async function updateBusinessAction(formData: FormData) {
  await requireAdmin();

  const businessId = String(formData.get("businessId") || "");
  const name = String(formData.get("name") || "").trim();
  const phone = normalizePhone(String(formData.get("phone") || ""));
  const whatsappInput = String(formData.get("whatsapp") || "").trim();
  const whatsapp = whatsappInput ? normalizePhone(whatsappInput) : null;
  const email = String(formData.get("email") || "").trim() || null;
  const website = String(formData.get("website") || "").trim() || null;
  const address = String(formData.get("address") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const pincode = String(formData.get("pincode") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const status = String(formData.get("status") || "");
  const isTopListing = String(formData.get("isTopListing")) === "true";
  const allowedStatuses = ["PENDING_PAYMENT", "PENDING_REVIEW", "ACTIVE", "SUSPENDED", "REJECTED"];

  if (
    !businessId
    || !name
    || !isValidIndianPhone(phone)
    || (whatsapp && !isValidIndianPhone(whatsapp))
    || !address
    || !city
    || !state
    || !/^\d{6}$/.test(pincode)
    || !allowedStatuses.includes(status)
  ) {
    adminRedirect("businesses", "error", "Enter valid business details");
  }

  let logoUrl: string | null = null;
  let coverUrl: string | null = null;

  try {
    [logoUrl, coverUrl] = await Promise.all([
      optionalUploadedImage(formData.get("logo"), "businesses"),
      optionalUploadedImage(formData.get("cover"), "businesses"),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image upload failed";
    adminRedirect("businesses", "error", message);
  }

  await prisma.business.update({
    where: { id: businessId },
    data: {
      name,
      phone,
      whatsapp,
      email,
      website,
      address,
      city,
      state,
      pincode,
      description,
      status: status as "PENDING_PAYMENT" | "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "REJECTED",
      isTopListing,
      ...(logoUrl ? { logoUrl } : {}),
      ...(coverUrl ? { coverUrl } : {}),
    },
  });
  revalidatePath("/admin");
  revalidatePath("/listing/top-listings");
  adminRedirect("businesses", "success", "Business updated");
}

export async function deleteBusinessAction(formData: FormData) {
  await requireAdmin();
  const businessId = String(formData.get("businessId") || "");

  if (!businessId) {
    adminRedirect("businesses", "error", "Business not found");
  }

  await prisma.business.delete({ where: { id: businessId } });
  revalidatePath("/admin");
  adminRedirect("businesses", "success", "Business deleted");
}

export async function updatePlanAction(formData: FormData) {
  await requireAdmin();

  const planId = String(formData.get("planId") || "");
  const name = String(formData.get("name") || "").trim();
  const durationMonths = Number(formData.get("durationMonths"));
  const priceRupees = Number(formData.get("priceRupees"));
  const isActive = String(formData.get("isActive")) === "true";

  if (!planId || !name || !Number.isInteger(durationMonths) || durationMonths < 1 || !Number.isFinite(priceRupees) || priceRupees < 0) {
    adminRedirect("plans", "error", "Enter valid plan details");
  }

  await prisma.subscriptionPlan.update({
    where: { id: planId },
    data: { name, durationMonths, pricePaise: Math.round(priceRupees * 100), isActive },
  });
  revalidatePath("/admin");
  adminRedirect("plans", "success", "Plan updated");
}

export async function deletePlanAction(formData: FormData) {
  await requireAdmin();
  const planId = String(formData.get("planId") || "");

  if (!planId) {
    adminRedirect("plans", "error", "Plan not found");
  }

  const relatedCount = await prisma.businessSubscription.count({ where: { planId } });

  if (relatedCount > 0) {
    await prisma.subscriptionPlan.update({ where: { id: planId }, data: { isActive: false } });
    revalidatePath("/admin");
    adminRedirect("plans", "success", "Plan has subscription history, so it was deactivated");
  }

  await prisma.subscriptionPlan.delete({ where: { id: planId } });
  revalidatePath("/admin");
  adminRedirect("plans", "success", "Plan deleted");
}

export async function deleteSubscriptionAction(formData: FormData) {
  await requireAdmin();
  const subscriptionId = String(formData.get("subscriptionId") || "");

  if (!subscriptionId) {
    adminRedirect("plans", "error", "Subscription not found");
  }

  await prisma.businessSubscription.delete({ where: { id: subscriptionId } });
  revalidatePath("/admin");
  adminRedirect("plans", "success", "Subscription deleted");
}

export async function updateSubscriptionAction(formData: FormData) {
  await requireAdmin();

  const subscriptionId = String(formData.get("subscriptionId") || "");
  const planId = String(formData.get("planId") || "");
  const startsAt = new Date(`${String(formData.get("startsAt") || "")}T00:00:00`);
  const expiresAt = new Date(`${String(formData.get("expiresAt") || "")}T00:00:00`);

  if (!subscriptionId || !planId || Number.isNaN(startsAt.getTime()) || Number.isNaN(expiresAt.getTime()) || expiresAt <= startsAt) {
    adminRedirect("plans", "error", "Enter valid subscription dates");
  }

  await prisma.businessSubscription.update({
    where: { id: subscriptionId },
    data: { planId, startsAt, expiresAt },
  });
  revalidatePath("/admin");
  adminRedirect("plans", "success", "Subscription updated");
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin();

  const categoryId = String(formData.get("categoryId") || "");
  const name = String(formData.get("name") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isActive = String(formData.get("isActive")) === "true";

  if (!categoryId || !name) {
    adminRedirect("categories", "error", "Category name is required");
  }

  await prisma.mainCategory.update({
    where: { id: categoryId },
    data: { name, sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0, isActive },
  });
  revalidatePath("/admin");
  adminRedirect("categories", "success", "Category updated");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const categoryId = String(formData.get("categoryId") || "");

  if (!categoryId) {
    adminRedirect("categories", "error", "Category not found");
  }

  await prisma.mainCategory.delete({ where: { id: categoryId } });
  revalidatePath("/admin");
  adminRedirect("categories", "success", "Category deleted");
}

export async function deletePaymentAction(formData: FormData) {
  await requireAdmin();
  const paymentId = String(formData.get("paymentId") || "");
  const payment = await prisma.payment.findUnique({ where: { id: paymentId }, select: { status: true } });

  if (!paymentId || !payment) {
    adminRedirect("payments", "error", "Payment not found");
  }

  if (payment.status === "CAPTURED") {
    adminRedirect("payments", "error", "Captured payments must be kept for financial history");
  }

  await prisma.payment.delete({ where: { id: paymentId } });
  revalidatePath("/admin");
  adminRedirect("payments", "success", "Payment deleted");
}

export async function createHomepageCardAction(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const imageAlt = String(formData.get("imageAlt") || "").trim() || null;
  const mainCategoryId = String(formData.get("mainCategoryId") || "");
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const category = await prisma.mainCategory.findUnique({
    where: { id: mainCategoryId },
    select: { id: true, slug: true },
  });

  if (!title || !category) {
    adminRedirect("homepage", "error", "Enter a card title and select its category");
  }

  try {
    const imageUrl = await saveUploadedImage(formData.get("image"), "homepage-cards");
    await prisma.homepageCard.create({
      data: {
        title,
        imageUrl,
        imageAlt,
        linkUrl: `/category/${category.slug}`,
        mainCategoryId: category.id,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      },
    });
  } catch (error) {
    homepageErrorRedirect(error);
  }

  revalidatePath("/");
  adminRedirect("homepage", "success", "Homepage card added");
}

export async function updateHomepageCardAction(formData: FormData) {
  await requireAdmin();

  const cardId = String(formData.get("cardId") || "");
  const title = String(formData.get("title") || "").trim();
  const imageAlt = String(formData.get("imageAlt") || "").trim() || null;
  const mainCategoryId = String(formData.get("mainCategoryId") || "");
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isActive = String(formData.get("isActive")) === "true";
  const category = await prisma.mainCategory.findUnique({
    where: { id: mainCategoryId },
    select: { id: true, slug: true },
  });

  if (!cardId || !title || !category) {
    adminRedirect("homepage", "error", "Enter valid homepage card details");
  }

  try {
    const imageUrl = await optionalUploadedImage(formData.get("image"), "homepage-cards");
    await prisma.homepageCard.update({
      where: { id: cardId },
      data: {
        title,
        imageAlt,
        linkUrl: `/category/${category.slug}`,
        mainCategoryId: category.id,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        isActive,
        ...(imageUrl ? { imageUrl } : {}),
      },
    });
  } catch (error) {
    homepageErrorRedirect(error);
  }

  revalidatePath("/");
  adminRedirect("homepage", "success", "Homepage card updated");
}

export async function deleteHomepageCardAction(formData: FormData) {
  await requireAdmin();
  const cardId = String(formData.get("cardId") || "");

  if (!cardId) {
    adminRedirect("homepage", "error", "Homepage card not found");
  }

  await prisma.homepageCard.delete({ where: { id: cardId } });
  revalidatePath("/");
  adminRedirect("homepage", "success", "Homepage card deleted");
}

export async function createHomepageTopCardAction(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const imageAlt = String(formData.get("imageAlt") || "").trim() || null;
  const mainCategoryId = String(formData.get("mainCategoryId") || "");
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const category = await prisma.mainCategory.findUnique({ where: { id: mainCategoryId }, select: { id: true } });

  if (!title || !category) {
    adminRedirect("homepage", "error", "Enter a top card title and select its category");
  }

  try {
    const imageUrl = await saveUploadedImage(formData.get("image"), "homepage-top-cards");
    await prisma.homepageTopCard.create({
      data: {
        title,
        imageUrl,
        imageAlt,
        mainCategoryId: category.id,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      },
    });
  } catch (error) {
    homepageErrorRedirect(error);
  }

  revalidatePath("/");
  adminRedirect("homepage", "success", "Top header card added");
}

export async function updateHomepageTopCardAction(formData: FormData) {
  await requireAdmin();

  const cardId = String(formData.get("cardId") || "");
  const title = String(formData.get("title") || "").trim();
  const imageAlt = String(formData.get("imageAlt") || "").trim() || null;
  const mainCategoryId = String(formData.get("mainCategoryId") || "");
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isActive = String(formData.get("isActive")) === "true";
  const category = await prisma.mainCategory.findUnique({ where: { id: mainCategoryId }, select: { id: true } });

  if (!cardId || !title || !category) {
    adminRedirect("homepage", "error", "Enter valid top header card details");
  }

  try {
    const imageUrl = await optionalUploadedImage(formData.get("image"), "homepage-top-cards");
    await prisma.homepageTopCard.update({
      where: { id: cardId },
      data: {
        title,
        imageAlt,
        mainCategoryId: category.id,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        isActive,
        ...(imageUrl ? { imageUrl } : {}),
      },
    });
  } catch (error) {
    homepageErrorRedirect(error);
  }

  revalidatePath("/");
  adminRedirect("homepage", "success", "Top header card updated");
}

export async function deleteHomepageTopCardAction(formData: FormData) {
  await requireAdmin();
  const cardId = String(formData.get("cardId") || "");

  if (!cardId) {
    adminRedirect("homepage", "error", "Top header card not found");
  }

  await prisma.homepageTopCard.delete({ where: { id: cardId } });
  revalidatePath("/");
  adminRedirect("homepage", "success", "Top header card deleted");
}

export async function createHomepageBannerAction(formData: FormData) {
  await requireAdmin();

  const eyebrow = String(formData.get("eyebrow") || "").trim() || null;
  const title = String(formData.get("title") || "").trim();
  const detail = String(formData.get("detail") || "").trim() || null;
  const imageAlt = String(formData.get("imageAlt") || "").trim() || null;
  const mainCategoryId = String(formData.get("mainCategoryId") || "");
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const category = await prisma.mainCategory.findUnique({ where: { id: mainCategoryId }, select: { id: true } });

  if (!title || !category) {
    adminRedirect("homepage", "error", "Enter a slider title and select its category");
  }

  try {
    const imageUrl = await saveUploadedImage(formData.get("image"), "homepage-banners");
    await prisma.homepageBanner.create({
      data: {
        eyebrow,
        title,
        detail,
        imageUrl,
        imageAlt,
        mainCategoryId: category.id,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      },
    });
  } catch (error) {
    homepageErrorRedirect(error);
  }

  revalidatePath("/");
  adminRedirect("homepage", "success", "Top slider image added");
}

export async function updateHomepageBannerAction(formData: FormData) {
  await requireAdmin();

  const bannerId = String(formData.get("bannerId") || "");
  const eyebrow = String(formData.get("eyebrow") || "").trim() || null;
  const title = String(formData.get("title") || "").trim();
  const detail = String(formData.get("detail") || "").trim() || null;
  const imageAlt = String(formData.get("imageAlt") || "").trim() || null;
  const mainCategoryId = String(formData.get("mainCategoryId") || "");
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isActive = String(formData.get("isActive")) === "true";
  const category = await prisma.mainCategory.findUnique({ where: { id: mainCategoryId }, select: { id: true } });

  if (!bannerId || !title || !category) {
    adminRedirect("homepage", "error", "Enter valid top slider details");
  }

  try {
    const imageUrl = await optionalUploadedImage(formData.get("image"), "homepage-banners");
    await prisma.homepageBanner.update({
      where: { id: bannerId },
      data: {
        eyebrow,
        title,
        detail,
        imageAlt,
        mainCategoryId: category.id,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        isActive,
        ...(imageUrl ? { imageUrl } : {}),
      },
    });
  } catch (error) {
    homepageErrorRedirect(error);
  }

  revalidatePath("/");
  adminRedirect("homepage", "success", "Top slider image updated");
}

export async function deleteHomepageBannerAction(formData: FormData) {
  await requireAdmin();
  const bannerId = String(formData.get("bannerId") || "");

  if (!bannerId) {
    adminRedirect("homepage", "error", "Top slider image not found");
  }

  await prisma.homepageBanner.delete({ where: { id: bannerId } });
  revalidatePath("/");
  adminRedirect("homepage", "success", "Top slider image deleted");
}

export async function addFooterPopularCategoryAction(formData: FormData) {
  await requireAdmin();

  const mainCategoryId = String(formData.get("mainCategoryId") || "");
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const category = await prisma.mainCategory.findUnique({ where: { id: mainCategoryId }, select: { id: true } });

  if (!category) {
    adminRedirect("pages", "error", "Select a valid popular category");
  }

  try {
    await prisma.footerPopularCategory.create({
      data: {
        mainCategoryId: category.id,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      },
    });
  } catch {
    adminRedirect("pages", "error", "This category is already in the footer");
  }

  revalidatePath("/");
  adminRedirect("pages", "success", "Popular category added");
}

export async function updateFooterPopularCategoryAction(formData: FormData) {
  await requireAdmin();

  const entryId = String(formData.get("entryId") || "");
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isActive = String(formData.get("isActive")) === "true";

  if (!entryId) {
    adminRedirect("pages", "error", "Popular category not found");
  }

  await prisma.footerPopularCategory.update({
    where: { id: entryId },
    data: {
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      isActive,
    },
  });

  revalidatePath("/");
  adminRedirect("pages", "success", "Popular category updated");
}

export async function deleteFooterPopularCategoryAction(formData: FormData) {
  await requireAdmin();
  const entryId = String(formData.get("entryId") || "");

  if (!entryId) {
    adminRedirect("pages", "error", "Popular category not found");
  }

  await prisma.footerPopularCategory.delete({ where: { id: entryId } });
  revalidatePath("/");
  adminRedirect("pages", "success", "Popular category removed");
}

export async function saveContentPagesAction(formData: FormData) {
  await requireAdmin();

  const values = [
    ["about_title", "About page title", String(formData.get("about_title") || "").trim(), false],
    ["about_body", "About page content", String(formData.get("about_body") || "").trim(), false],
    ["contact_title", "Contact page title", String(formData.get("contact_title") || "").trim(), false],
    ["contact_body", "Contact page content", String(formData.get("contact_body") || "").trim(), false],
    ["contact_phone", "Contact phone", String(formData.get("contact_phone") || "").trim(), false],
    ["contact_email", "Contact email", String(formData.get("contact_email") || "").trim(), false],
    ["contact_address", "Contact address", String(formData.get("contact_address") || "").trim(), false],
  ] as const;

  await Promise.all(
    values.map(([key, label, value, isSecret]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value, label, isSecret },
        create: { key, value, label, isSecret },
      }),
    ),
  );

  revalidatePath("/about");
  revalidatePath("/contact-us");
  adminRedirect("pages", "success", "About and contact pages saved");
}
