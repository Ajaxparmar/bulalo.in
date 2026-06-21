"use server";

import { redirect } from "next/navigation";
import { createSession, hashPassword } from "@/app/lib/auth";
import { isValidIndianPhone, normalizePhone, phoneLookupCandidates } from "@/app/lib/phone";
import { prisma } from "@/app/lib/prisma";
import { uniqueSlug } from "@/app/lib/slug";

export async function registerOwnerAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const phoneInput = String(formData.get("phone") || "").trim();
  const phone = normalizePhone(phoneInput);
  const email = String(formData.get("email") || "").trim() || null;
  const password = String(formData.get("password") || "");
  const businessName = String(formData.get("businessName") || "").trim();
  const businessPhone = String(formData.get("businessPhone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const pincode = String(formData.get("pincode") || "").trim();
  const planId = String(formData.get("planId") || "").trim();
  const categoryId = String(formData.get("categoryId") || "").trim();

  const missingFields = [
    !planId ? "plan" : "",
    !categoryId ? "category" : "",
    !name ? "owner name" : "",
    !phoneInput ? "phone number" : "",
    !password ? "password" : "",
    !businessName ? "shop name" : "",
    !businessPhone ? "shop phone" : "",
    !address ? "address" : "",
    !city ? "city" : "",
    !state ? "state" : "",
    !pincode ? "pincode" : "",
  ].filter(Boolean);

  if (missingFields.length > 0) {
    redirect(`/register?error=${encodeURIComponent(`Please fill: ${missingFields.join(", ")}`)}`);
  }

  if (!isValidIndianPhone(phone)) {
    redirect("/register?error=Enter%20a%20valid%2010-digit%20Indian%20mobile%20number");
  }

  if (password.length < 6) {
    redirect("/register?error=Password%20must%20contain%20at%20least%206%20characters");
  }

  if (!/^\d{6}$/.test(pincode)) {
    redirect("/register?error=Enter%20a%20valid%206-digit%20pincode");
  }

  const [category, plan] = await Promise.all([
    prisma.mainCategory.findFirst({
      where: { id: categoryId, isActive: true },
      select: { id: true },
    }),
    prisma.subscriptionPlan.findFirst({
      where: { id: planId, isActive: true },
    }),
  ]);

  if (!category || !plan) {
    redirect("/register?error=Select%20a%20valid%20category%20and%20plan");
  }

  const existingUser = await prisma.user.findFirst({
    where: { phone: { in: phoneLookupCandidates(phoneInput) } },
  });

  if (existingUser) {
    redirect("/login?error=This%20phone%20number%20is%20already%20saved.%20Login%20to%20continue%20payment");
  }

  const user = await prisma.user.create({
    data: {
      name,
      phone,
      email,
      passwordHash: hashPassword(password),
      role: "SHOP_OWNER",
    },
  });

  const business = await prisma.business.create({
    data: {
      ownerId: user.id,
      name: businessName,
      slug: uniqueSlug(businessName),
      phone: businessPhone,
      email,
      address,
      city,
      state,
      pincode,
      status: "PENDING_PAYMENT",
    },
  });

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      businessId: business.id,
      planId: plan.id,
      amountPaise: plan.pricePaise,
      currency: "INR",
      status: "CREATED",
      razorpayOrderId: `pending_${business.id}_${Date.now()}`,
      razorpayReceipt: `REG-${business.id}`,
    },
  });

  await prisma.businessCategory.create({
    data: { businessId: business.id, mainCategoryId: category.id },
  });

  await createSession(user.id);
  redirect(`/register/payment/${payment.id}`);
}
