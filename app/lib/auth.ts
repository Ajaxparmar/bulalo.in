import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "@/app/lib/prisma";

const SESSION_COOKIE = "bulalo_session_v2";
const LEGACY_SESSION_COOKIE = "abhi_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function shouldUseSecureCookie() {
  if (process.env.AUTH_COOKIE_SECURE === "true") {
    return true;
  }

  if (process.env.AUTH_COOKIE_SECURE === "false") {
    return false;
  }

  return process.env.AUTH_URL?.startsWith("https://") ?? false;
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, originalHash] = storedHash.split(":");

  if (!salt || !originalHash) {
    return false;
  }

  const hash = scryptSync(password, salt, 64);
  const original = Buffer.from(originalHash, "hex");

  return original.length === hash.length && timingSafeEqual(original, hash);
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  const token = randomBytes(32).toString("base64url");
  const cookieStore = await cookies();

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
    },
  });

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(),
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
    priority: "high",
  });
  cookieStore.delete(LEGACY_SESSION_COOKIE);
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
  }

  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(LEGACY_SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user || !user.isActive) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return user;
}
