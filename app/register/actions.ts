"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@/app/generated/prisma/client";
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
  const businessPhoneNormalized = normalizePhone(businessPhone);

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

  if (!isValidIndianPhone(businessPhoneNormalized)) {
    redirect("/register?error=Enter%20a%20valid%2010-digit%20shop%20phone%20number");
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

  let userId: string;
  let paymentId: string;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          phone,
          email,
          passwordHash: hashPassword(password),
          role: "SHOP_OWNER",
        },
      });

      const createdBusiness = await tx.business.create({
        data: {
          ownerId: createdUser.id,
          name: businessName,
          slug: uniqueSlug(businessName),
          phone: businessPhoneNormalized,
          email,
          address,
          city,
          state,
          pincode,
          status: "PENDING_PAYMENT",
        },
      });

      const createdPayment = await tx.payment.create({
        data: {
          userId: createdUser.id,
          businessId: createdBusiness.id,
          planId: plan.id,
          amountPaise: plan.pricePaise,
          currency: "INR",
          status: "CREATED",
          razorpayOrderId: `pending_${createdBusiness.id}_${Date.now()}`,
          razorpayReceipt: `REG-${createdBusiness.id}`,
        },
      });

      await tx.businessCategory.create({
        data: { businessId: createdBusiness.id, mainCategoryId: category.id },
      });

      return { userId: createdUser.id, paymentId: createdPayment.id };
    });

    userId = result.userId;
    paymentId = result.paymentId;
  } catch (error) {
    console.error("Shop registration failed", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect("/register?error=This%20phone%20number%20or%20shop%20details%20are%20already%20saved");
    }

    redirect("/register?error=Unable%20to%20save%20shop%20details.%20Please%20try%20again");
  }

  await createSession(userId);
  redirect(`/register/payment/${paymentId}`);
}
