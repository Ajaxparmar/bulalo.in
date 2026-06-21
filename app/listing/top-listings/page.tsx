import Link from "next/link";
import BusinessListingCard from "@/app/components/BusinessListingCard";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TopListingsPage() {
  const businesses = await prisma.business.findMany({
    where: {
      status: "ACTIVE",
      isTopListing: true,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      categories: { include: { mainCategory: true } },
      ratings: { select: { rating: true } },
    },
  });

  return (
    <main className="category-results-page">
      <nav className="results-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <i className="fas fa-chevron-right" />
        <span>Top Listings</span>
      </nav>

      <p className="results-count">
        Showing {businesses.length} top listing{businesses.length === 1 ? "" : "s"}
      </p>
      <h1 className="results-title">
        Featured shops on <span>Bulalo.in</span>
      </h1>

      <section className="results-grid">
        {businesses.map((business) => (
          <BusinessListingCard key={business.id} business={business} />
        ))}
        {businesses.length === 0 ? (
          <p className="empty-state">No active shops have been marked as top listings yet.</p>
        ) : null}
      </section>
    </main>
  );
}
