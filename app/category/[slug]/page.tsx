import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ subcategory?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await prisma.mainCategory.findUnique({
    where: { slug },
    include: {
      subcategories: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
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
      ...(query.subcategory
        ? {
            subcategories: {
              some: { subcategoryId: query.subcategory },
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      subcategories: { include: { subcategory: true } },
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

      <div className="category-results-layout">
        <aside className="subcategory-sidebar">
          <h2>Subcategories</h2>
          <nav aria-label="Subcategory filters">
            <Link className={!query.subcategory ? "active" : ""} href={`/category/${category.slug}`}>
              <i className="fas fa-th-large" /> All {category.name}
            </Link>
            {category.subcategories.map((subcategory) => (
              <Link
                key={subcategory.id}
                className={query.subcategory === subcategory.id ? "active" : ""}
                href={`/category/${category.slug}?subcategory=${subcategory.id}`}
              >
                <i className="fas fa-chevron-right" /> {subcategory.name}
              </Link>
            ))}
          </nav>
        </aside>

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
              <p className="result-new-listing">New Listing</p>
              <p className="result-address">
                {business.address}, {business.city}, {business.state} {business.pincode}
              </p>
              <p className="result-open"><b>Open at:</b> 09:00 am</p>
              <div className="result-tags">
                {business.subcategories.map((item) => (
                  <span key={item.subcategory.id}>{item.subcategory.name}</span>
                ))}
                <span className="category-tag">{category.name}</span>
              </div>
              {business.description ? (
                <p className="result-description">
                  <i className="far fa-comment-dots" /> {business.description}
                </p>
              ) : null}
              <a href={`tel:${business.phone}`} className="result-call-button">
                <i className="fas fa-phone" /> Show Number
              </a>
            </div>
          </article>
        ))}
        {businesses.length === 0 ? (
          <p className="empty-state">No active shops found for this filter.</p>
        ) : null}
        </section>
      </div>
    </main>
  );
}
