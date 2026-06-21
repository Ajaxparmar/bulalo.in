import Link from "next/link";
import { notFound } from "next/navigation";
import BusinessListingCard from "@/app/components/BusinessListingCard";
import { prisma } from "@/app/lib/prisma";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await prisma.mainCategory.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  const businesses = await prisma.business.findMany({
    where: {
      status: "ACTIVE",
      categories: {
        some: { mainCategoryId: category.id },
      },
    },
    orderBy: [{ isTopListing: "desc" }, { createdAt: "desc" }],
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
        <span>Top Listing - {category.name}</span>
      </nav>

      <p className="results-count">Showing {businesses.length} listing{businesses.length === 1 ? "" : "s"}</p>
      <h1 className="results-title">
        your category result for - <span>{category.name}</span>
      </h1>

      <section className="results-grid">
        {businesses.map((business) => (
          <BusinessListingCard key={business.id} business={business} />
        ))}
        {businesses.length === 0 ? (
          <p className="empty-state">No active shops found in this category.</p>
        ) : null}
      </section>
    </main>
  );
}
