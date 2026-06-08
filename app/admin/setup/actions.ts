"use server";

import { redirect } from "next/navigation";
import { createSession, hashPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function createFirstAdminAction(formData: FormData) {
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });

  if (adminCount > 0) {
    redirect("/login");
  }

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim() || null;
  const password = String(formData.get("password") || "");

  if (!name || !phone || password.length < 8) {
    redirect("/admin/setup?error=Name,%20phone,%20and%208%20character%20password%20are%20required");
  }

  const admin = await prisma.user.create({
    data: {
      name,
      phone,
      email,
      passwordHash: hashPassword(password),
      role: "ADMIN",
    },
  });

  await createSession(admin.id);
  redirect("/admin");
}
