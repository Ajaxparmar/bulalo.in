import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { ratingSummary } from "@/app/lib/rating";

const RATING_COOKIE = "bulalo_rating_token";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  const { businessId } = await params;
  const body = await request.json().catch(() => null) as { rating?: number } | null;
  const rating = Number(body?.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Choose a rating from 1 to 5 stars" }, { status: 400 });
  }

  const business = await prisma.business.findFirst({
    where: { id: businessId, status: "ACTIVE" },
    select: { id: true },
  });

  if (!business) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  const cookieStore = await cookies();
  let reviewerToken = cookieStore.get(RATING_COOKIE)?.value;

  if (!reviewerToken) {
    reviewerToken = randomBytes(24).toString("base64url");
    cookieStore.set(RATING_COOKIE, reviewerToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.AUTH_URL?.startsWith("https://") ?? false,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const existing = await prisma.businessRating.findUnique({
    where: { businessId_reviewerToken: { businessId, reviewerToken } },
    select: { id: true },
  });

  await prisma.businessRating.upsert({
    where: { businessId_reviewerToken: { businessId, reviewerToken } },
    update: { rating },
    create: { businessId, reviewerToken, rating },
  });

  const ratings = await prisma.businessRating.findMany({
    where: { businessId },
    select: { rating: true },
  });
  const summary = ratingSummary(ratings);

  return NextResponse.json({
    success: true,
    updated: Boolean(existing),
    average: summary.average,
    count: summary.count,
  });
}
