import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AllSubCategoriesPage() {
  const cards = await prisma.homepageCard.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { mainCategory: { select: { slug: true } } },
  });

  return (
    <main className="directory-card-page">
      <header>
        <p className="eyebrow">Featured services</p>
        <h1>All Sub Categories</h1>
      </header>
      <section className="directory-card-grid">
        {cards.map((card) => (
          <Link
            key={card.id}
            href={card.mainCategory ? `/category/${card.mainCategory.slug}` : card.linkUrl}
            className="directory-link-card"
          >
            <img src={card.imageUrl} alt={card.imageAlt || card.title} />
            <strong>{card.title}</strong>
          </Link>
        ))}
        {cards.length === 0 ? <p className="empty-state">No sub-category cards have been added yet.</p> : null}
      </section>
    </main>
  );
}
