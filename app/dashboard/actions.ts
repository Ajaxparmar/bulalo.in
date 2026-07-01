"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/app/lib/auth";
import { isValidIndianPhone, normalizePhone } from "@/app/lib/phone";
import { prisma } from "@/app/lib/prisma";
import { optionalUploadedImage } from "@/app/lib/uploads";

function dashboardRedirect(type: "success" | "error", message: string): never {
  redirect(`/dashboard?${type}=${encodeURIComponent(message)}`);
}

export async function updateOwnerBusinessAction(formData: FormData) {
  const user = await requireUser();
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

  if (
    !businessId
    || !name
    || !isValidIndianPhone(phone)
    || (whatsapp && !isValidIndianPhone(whatsapp))
    || !address
    || !city
    || !state
    || !/^\d{6}$/.test(pincode)
  ) {
    dashboardRedirect("error", "Enter valid business details");
  }

  const business = await prisma.business.findFirst({
    where: { id: businessId, ownerId: user.id },
    select: { id: true, slug: true },
  });

  if (!business) {
    dashboardRedirect("error", "Business not found");
  }

  let logoUrl: string | null = null;
  let coverUrl: string | null = null;

  try {
    [logoUrl, coverUrl] = await Promise.all([
      optionalUploadedImage(formData.get("logo"), "businesses"),
      optionalUploadedImage(formData.get("cover"), "businesses"),
    ]);
  } catch (error) {
    dashboardRedirect("error", error instanceof Error ? error.message : "Image upload failed");
  }

  await prisma.business.update({
    where: { id: business.id },
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
      ...(logoUrl ? { logoUrl } : {}),
      ...(coverUrl ? { coverUrl } : {}),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/business/${business.slug}`);
  revalidatePath("/listing/top-listings");
  dashboardRedirect("success", "Business details updated");
}
