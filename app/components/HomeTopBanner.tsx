import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import HomeTopBannerSlider, { HeaderSlide } from "@/app/components/HomeTopBannerSlider";

const fallbackTopCards = [
  { id: "equipment", title: "Equipment", href: "/category/equipment", icon: "fas fa-tools" },
  { id: "catering", title: "Catering Services", href: "/category/catering-services", icon: "fas fa-utensils" },
  { id: "real-estate", title: "Real Estate", href: "/category/real-estate", icon: "fas fa-home" },
];

const fallbackSlides: HeaderSlide[] = [
  { id: "medical", eyebrow: "Featured banner", title: "Add your medical promotional image", detail: "Recommended size: 1200 × 520 px", href: "/category/medical", tone: "medical" },
  { id: "home", eyebrow: "Home services", title: "Add your home decor promotional image", detail: "Recommended size: 1200 × 520 px", href: "/category/home-decor", tone: "home" },
  { id: "grocery", eyebrow: "Local shopping", title: "Add your grocery promotional image", detail: "Recommended size: 1200 × 520 px", href: "/category/grocery", tone: "grocery" },
  { id: "moving", eyebrow: "Move with confidence", title: "Add your packers and movers image", detail: "Recommended size: 1200 × 520 px", href: "/category/packers-and-movers", tone: "moving" },
];

export default async function HomeTopBanner() {
  const [topCards, banners] = await Promise.all([
    prisma.homepageTopCard.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: 3,
      include: { mainCategory: { select: { slug: true } } },
    }),
    prisma.homepageBanner.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { mainCategory: { select: { slug: true } } },
    }),
  ]);

  const slides: HeaderSlide[] = banners.length > 0
    ? banners.map((banner) => ({
        id: banner.id,
        eyebrow: banner.eyebrow || "Featured banner",
        title: banner.title,
        detail: banner.detail || "",
        imageUrl: banner.imageUrl,
        imageAlt: banner.imageAlt || undefined,
        href: `/category/${banner.mainCategory.slug}`,
      }))
    : fallbackSlides;

  return (
    <section className="home-top-banner" aria-label="Featured categories and promotion">
      <div className="home-top-category-grid">
        {topCards.length > 0
          ? topCards.map((card) => (
              <Link key={card.id} href={`/category/${card.mainCategory.slug}`} className="home-top-category-card">
                <img src={card.imageUrl} alt={card.imageAlt || card.title} />
                <h2>{card.title}</h2>
              </Link>
            ))
          : fallbackTopCards.map((card) => (
              <Link key={card.id} href={card.href} className="home-top-category-card">
                <div className="home-top-placeholder">
                  <i className={card.icon} />
                  <span>Add category image</span>
                </div>
                <h2>{card.title}</h2>
              </Link>
            ))}
      </div>

      <HomeTopBannerSlider slides={slides} />
    </section>
  );
}
