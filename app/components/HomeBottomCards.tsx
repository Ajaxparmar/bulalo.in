import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import SafeImage from "@/app/components/SafeImage";
import HomeBottomCardSlider, { BottomCard } from "@/app/components/HomeBottomCardSlider";

const fallbackCards: BottomCard[] = [
  { id: "equipment", title: "Equipment", href: "/category/equipment", icon: "fas fa-tools" },
  { id: "catering", title: "Catering", href: "/category/catering-services", icon: "fas fa-utensils" },
  { id: "real-estate", title: "Real Estate", href: "/category/real-estate", icon: "fas fa-home" },
  { id: "medical", title: "Medical", href: "/category/medical", icon: "fas fa-clinic-medical" },
  { id: "education", title: "Education", href: "/category/education", icon: "fas fa-graduation-cap" },
  { id: "shopping", title: "Shopping", href: "/category/shopping", icon: "fas fa-shopping-bag" },
  { id: "automobile", title: "Automobile", href: "/category/automobile", icon: "fas fa-car" },
];

export default async function HomeBottomCards() {
  const [cards, popularCategories, recentVisits] = await Promise.all([
    prisma.homepageCard.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { mainCategory: { select: { slug: true } } },
    }),
    prisma.footerPopularCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: 12,
      include: { mainCategory: { select: { name: true, slug: true, isActive: true } } },
    }),
    prisma.businessVisit.findMany({
      orderBy: { createdAt: "desc" },
      take: 18,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            coverUrl: true,
            city: true,
            state: true,
            status: true,
          },
        },
      },
    }),
  ]);

  const sliderCards: BottomCard[] = cards.length > 0
    ? cards.map((card) => ({
        id: card.id,
        title: card.title,
        href: card.mainCategory ? `/category/${card.mainCategory.slug}` : card.linkUrl,
        imageUrl: card.imageUrl,
        imageAlt: card.imageAlt || undefined,
      }))
    : fallbackCards;
  const recentBusinesses = recentVisits
    .filter((visit) => visit.business.status === "ACTIVE")
    .filter((visit, index, visits) => visits.findIndex((item) => item.businessId === visit.businessId) === index)
    .slice(0, 6);

  return (
    <section className="home-bottom-cards" aria-label="Featured categories">
      <div className="home-recent-visits" aria-label="Recently visited businesses">
        <h2>Recent Visiting</h2>
        {recentBusinesses.length > 0 ? (
          <div className="home-recent-visit-grid">
            {recentBusinesses.map((visit) => (
              <Link key={visit.businessId} href={`/business/${visit.business.slug}`} className="home-recent-visit-card">
                <SafeImage
                  src={visit.business.coverUrl || visit.business.logoUrl}
                  alt={visit.business.name}
                  fallback={<span>{visit.business.name.slice(0, 1)}</span>}
                />
                <div>
                  <strong>{visit.business.name}</strong>
                  <small>{visit.business.city}, {visit.business.state}</small>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="home-recent-visit-empty">Recently visited businesses will appear here.</p>
        )}
      </div>
      <HomeBottomCardSlider cards={sliderCards} />
      <div className="home-popular-categories" aria-label="Popular categories">
        <h2>Popular Categories</h2>
        <div>
          {popularCategories
            .filter((entry) => entry.mainCategory.isActive)
            .map((entry) => (
              <Link key={entry.id} href={`/category/${entry.mainCategory.slug}`}>
                {entry.mainCategory.name}
              </Link>
            ))}
          {popularCategories.length === 0 ? <span>Categories coming soon</span> : null}
        </div>
      </div>
    </section>
  );
}
