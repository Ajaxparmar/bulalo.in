"use server";

import { redirect } from "next/navigation";
import { createSession, hashPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { uniqueSlug } from "@/app/lib/slug";

function checkedValues(formData: FormData, key: string) {
  return formData.getAll(key).map(String).filter(Boolean);
}

export async function registerOwnerAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim() || null;
  const password = String(formData.get("password") || "");
  const businessName = String(formData.get("businessName") || "").trim();
  const businessPhone = String(formData.get("businessPhone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const pincode = String(formData.get("pincode") || "").trim();
  const planId = String(formData.get("planId") || "");
  const categoryIds = checkedValues(formData, "categoryIds");
  const subcategoryIds = checkedValues(formData, "subcategoryIds");

  if (!name || !phone || password.length < 6 || !businessName || !businessPhone || !address || !city || !state || !pincode || !planId) {
    redirect("/register?error=Please%20fill%20all%20required%20fields");
  }

  if (categoryIds.length < 1 || categoryIds.length > 3 || subcategoryIds.length < 1 || subcategoryIds.length > 3) {
    redirect("/register?error=Select%201%20to%203%20categories%20and%201%20to%203%20subcategories");
  }

  const [matchingSubcategories, plan] = await Promise.all([
    prisma.subcategory.findMany({
      where: {
        id: { in: subcategoryIds },
        mainCategoryId: { in: categoryIds },
        isActive: true,
      },
      select: { id: true },
    }),
    prisma.subscriptionPlan.findFirst({
      where: { id: planId, isActive: true },
    }),
  ]);

  if (matchingSubcategories.length !== subcategoryIds.length || !plan) {
    redirect("/register?error=Selected%20subcategories%20must%20belong%20to%20selected%20categories");
  }

  const existingUser = await prisma.user.findUnique({ where: { phone } });

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

  await Promise.all([
    ...categoryIds.map((mainCategoryId) =>
      prisma.businessCategory.create({
        data: { businessId: business.id, mainCategoryId },
      }),
    ),
    ...subcategoryIds.map((subcategoryId) =>
      prisma.businessSubcategory.create({
        data: { businessId: business.id, subcategoryId },
      }),
    ),
  ]);

  await createSession(user.id);
  redirect(`/register/payment/${payment.id}`);
}
