import Link from "next/link";
import BusinessListingCard from "@/app/components/BusinessListingCard";
import { fuzzyScore } from "@/app/lib/fuzzy-search";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SearchBusinessPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = "" } = await searchParams;
  const query = search.trim();

  const [categories, activeBusinesses] = query.length >= 2
    ? await Promise.all([
        prisma.mainCategory.findMany({
          where: { isActive: true },
          select: { id: true, name: true, slug: true },
        }),
        prisma.business.findMany({
          where: { status: "ACTIVE" },
          orderBy: [{ isTopListing: "desc" }, { createdAt: "desc" }],
          include: {
            categories: { include: { mainCategory: true } },
            ratings: { select: { rating: true } },
          },
        }),
      ])
    : [[], []];

  const categoryMatches = categories
    .map((category) => ({
      ...category,
      score: fuzzyScore(query, category.name),
    }))
    .filter((category) => category.score > 0)
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));

  const businesses = activeBusinesses
    .map((business) => {
      const categoryScore = Math.max(
        0,
        ...business.categories.map((item) => fuzzyScore(query, item.mainCategory.name)),
      );
      const nameScore = fuzzyScore(query, business.name);
      const exactDetails = [
        business.description,
        business.address,
        business.city,
        business.state,
        business.pincode,
        business.phone,
      ].some((value) => value?.toLowerCase().includes(query.toLowerCase()));

      return {
        business,
        score: Math.max(nameScore, categoryScore, exactDetails ? 55 : 0),
      };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) =>
      right.score - left.score
      || Number(Boolean(right.business.isTopListing)) - Number(Boolean(left.business.isTopListing))
      || right.business.createdAt.getTime() - left.business.createdAt.getTime()
    )
    .slice(0, 100)
    .map((result) => result.business);

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

      {categoryMatches.length > 0 ? (
        <nav className="search-category-matches" aria-label="Matching categories">
          <span>Matching categories:</span>
          {categoryMatches.slice(0, 8).map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>{category.name}</Link>
          ))}
        </nav>
      ) : null}

      <section className="results-grid">
        {businesses.map((business) => (
          <BusinessListingCard key={business.id} business={business} />
        ))}
        {query.length >= 2 && businesses.length === 0 ? (
          <p className="empty-state">
            {categoryMatches.length > 0
              ? "This category currently has no active shop listings."
              : "No active shops match your search."}
          </p>
        ) : null}
        {query.length < 2 ? <p className="empty-state">Enter at least two characters to search.</p> : null}
      </section>
    </main>
  );
}
