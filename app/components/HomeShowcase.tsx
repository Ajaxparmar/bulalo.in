import Link from 'next/link';
import { prisma } from '@/app/lib/prisma';

export default async function HomeShowcase() {
  const categories = await prisma.mainCategory.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  return (
    <section className="home-showcase" aria-label="Popular categories">
      <h1 className="showcase-heading">
        Get best services - <span>&quot;from 2000+ business listing&quot;</span>
      </h1>
      <div className="showcase-categories">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="showcase-category db-category-card"
          >
            <img src={category.imageUrl} alt={category.imageAlt || category.name} />
            <span>{category.name}</span>
          </Link>
        ))}
        {categories.length === 0 ? (
          <div className="empty-state">Admin can add categories to show them here.</div>
        ) : null}
      </div>
    </section>
  );
}
