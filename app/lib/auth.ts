import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "@/app/lib/prisma";

const SESSION_COOKIE = "abhi_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function getAuthSecret() {
  return process.env.AUTH_SECRET || "change-this-auth-secret-in-production";
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
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
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt })).toString("base64url");
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.AUTH_COOKIE_SECURE === "true",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
    priority: "high",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      userId: string;
      expiresAt: number;
    };

    if (!session.userId || session.expiresAt < Date.now()) {
      return null;
    }

    return prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  } catch {
    return null;
  }
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
