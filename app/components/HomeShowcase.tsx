import Link from 'next/link';
import { prisma } from '@/app/lib/prisma';

export default async function HomeShowcase() {
  const categories = await prisma.mainCategory.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    take: 12,
  });

  return (
    <section className="home-showcase" aria-label="Popular categories and featured service">
      <div className="showcase-categories">
        {categories.map((category) => (
          <Link
            key={category.name}
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

      <Link href="/category/security-services" className="showcase-banner">
        <div className="showcase-camera" aria-hidden="true">
          <div className="showcase-camera-body">
            <div className="showcase-camera-lens" />
          </div>
          <div className="showcase-camera-arm" />
        </div>
        <div className="showcase-banner-content">
          <h1>CCTV &amp; Security</h1>
          <div className="showcase-banner-line" />
          <p>Solution</p>
          <span>First choice for security professionals</span>
          <b>Get Best Deals</b>
        </div>
        <div className="showcase-dots" aria-hidden="true">
          <i />
          <i className="active" />
          <i />
          <i />
          <i />
          <i />
        </div>
      </Link>
    </section>
  );
}
