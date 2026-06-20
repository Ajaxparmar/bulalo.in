import Link from "next/link";
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
          <article key={business.id} className="result-card top-listing-card">
            {business.coverUrl || business.logoUrl ? (
              <img
                className="result-card-image"
                src={business.coverUrl || business.logoUrl || ""}
                alt={business.name}
              />
            ) : (
              <div className="result-card-placeholder">{business.name.slice(0, 1)}</div>
            )}
            <div className="result-card-body">
              <p className="result-top-listing"><i className="fas fa-star" /> Top Listing</p>
              <h2>
                {business.name} <span><i className="fas fa-check" /> Verified</span>
              </h2>
              <p className="result-address">
                {business.address}, {business.city}, {business.state} {business.pincode}
              </p>
              <div className="result-tags">
                {business.categories.map((item) => (
                  <Link key={item.mainCategory.id} href={`/category/${item.mainCategory.slug}`}>
                    {item.mainCategory.name}
                  </Link>
                ))}
              </div>
              {business.description ? (
                <p className="result-description">
                  <i className="far fa-comment-dots" /> {business.description}
                </p>
              ) : null}
              <Link href={`tel:${business.phone}`} className="result-call-button">
                <i className="fas fa-phone" /> Show Number
              </Link>
            </div>
          </article>
        ))}
        {businesses.length === 0 ? (
          <p className="empty-state">No active shops have been marked as top listings yet.</p>
        ) : null}
      </section>
    </main>
  );
}
