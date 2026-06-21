import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AllCategoriesPage() {
  const categories = await prisma.mainCategory.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <main className="directory-card-page">
      <header>
        <p className="eyebrow">Browse directory</p>
        <h1>All Categories</h1>
      </header>
      <section className="directory-card-grid">
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.slug}`} className="directory-link-card">
            <img src={category.imageUrl} alt={category.imageAlt || category.name} />
            <strong>{category.name}</strong>
          </Link>
        ))}
      </section>
    </main>
  );
}
