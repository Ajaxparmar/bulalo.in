import { prisma } from "@/app/lib/prisma";
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
  const cards = await prisma.homepageCard.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { mainCategory: { select: { slug: true } } },
  });

  const sliderCards: BottomCard[] = cards.length > 0
    ? cards.map((card) => ({
        id: card.id,
        title: card.title,
        href: card.mainCategory ? `/category/${card.mainCategory.slug}` : card.linkUrl,
        imageUrl: card.imageUrl,
        imageAlt: card.imageAlt || undefined,
      }))
    : fallbackCards;

  return (
    <section className="home-bottom-cards" aria-label="Featured categories">
      <HomeBottomCardSlider cards={sliderCards} />
    </section>
  );
}
