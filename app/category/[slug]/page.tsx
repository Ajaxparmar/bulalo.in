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
    <main className="listing-page">
      <section className="category-hero">
        <img src={category.imageUrl} alt={category.imageAlt || category.name} />
        <div>
          <p className="eyebrow">Category</p>
          <h1>{category.name}</h1>
          {category.description ? <p>{category.description}</p> : null}
        </div>
      </section>

      <nav className="filter-row" aria-label="Subcategory filters">
        <Link className={!query.subcategory ? "active" : ""} href={`/category/${category.slug}`}>
          All
        </Link>
        {category.subcategories.map((subcategory) => (
          <Link
            key={subcategory.id}
            className={query.subcategory === subcategory.id ? "active" : ""}
            href={`/category/${category.slug}?subcategory=${subcategory.id}`}
          >
            {subcategory.name}
          </Link>
        ))}
      </nav>

      <section className="shop-list">
        {businesses.map((business) => (
          <article key={business.id} className="shop-card">
            {business.logoUrl ? <img src={business.logoUrl} alt={business.name} /> : <div className="shop-placeholder">{business.name.slice(0, 1)}</div>}
            <div>
              <h2>{business.name}</h2>
              <p>{business.description || `${business.address}, ${business.city}`}</p>
              <p className="muted">{business.subcategories.map((item) => item.subcategory.name).join(", ")}</p>
              <a href={`tel:${business.phone}`} className="secondary-button">Call {business.phone}</a>
            </div>
          </article>
        ))}
        {businesses.length === 0 ? (
          <p className="empty-state">No active shops found for this filter.</p>
        ) : null}
      </section>
    </main>
  );
}
