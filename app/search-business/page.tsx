import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SearchBusinessPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = "" } = await searchParams;
  const query = search.trim();

  const matchingCategories = query
    ? await prisma.mainCategory.findMany({
        where: {
          isActive: true,
          name: { contains: query, mode: "insensitive" },
        },
        select: { id: true },
      })
    : [];

  const categoryIds = matchingCategories.map((category) => category.id);
  const businesses = query
    ? await prisma.business.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { address: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
            { state: { contains: query, mode: "insensitive" } },
            { pincode: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            ...(categoryIds.length > 0
              ? [{ categories: { some: { mainCategoryId: { in: categoryIds } } } }]
              : []),
          ],
        },
        orderBy: [{ isTopListing: "desc" }, { createdAt: "desc" }],
        include: {
          categories: { include: { mainCategory: true } },
        },
      })
    : [];

  return (
    <main className="category-results-page">
      <nav className="results-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <i className="fas fa-chevron-right" />
        <span>Search shops</span>
      </nav>

      <p className="results-count">
        Showing {businesses.length} listing{businesses.length === 1 ? "" : "s"}
      </p>
      <h1 className="results-title">
        Shop search results for - <span>{query || "Enter a search term"}</span>
      </h1>

      <section className="results-grid">
        {businesses.map((business) => (
          <article key={business.id} className="result-card">
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
              <h2>
                {business.name} <span><i className="fas fa-check" /> Verified</span>
              </h2>
              {business.isTopListing ? <p className="result-top-listing"><i className="fas fa-star" /> Top Listing</p> : null}
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
        {query && businesses.length === 0 ? (
          <p className="empty-state">No active shops match your search.</p>
        ) : null}
        {!query ? <p className="empty-state">Use the search box above to find a shop.</p> : null}
      </section>
    </main>
  );
}
