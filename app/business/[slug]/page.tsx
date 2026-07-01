import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { ratingSummary } from "@/app/lib/rating";
import RatingForm from "./RatingForm";

export const dynamic = "force-dynamic";

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await prisma.business.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      categories: { include: { mainCategory: true } },
      ratings: { select: { rating: true } },
    },
  });

  if (!business) {
    notFound();
  }

  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || headerStore.get("x-real-ip");
  try {
    await prisma.businessVisit.create({
      data: {
        businessId: business.id,
        ipAddress,
        userAgent: headerStore.get("user-agent"),
        referrer: headerStore.get("referer"),
        path: `/business/${slug}`,
      },
    });
  } catch (error) {
    console.error("Business visit logging failed", error);
  }

  const summary = ratingSummary(business.ratings);
  const whatsapp = (business.whatsapp || business.phone).replace(/\D/g, "");

  return (
    <main className="business-detail-page">
      <nav className="results-breadcrumb">
        <Link href="/">Home</Link><i className="fas fa-chevron-right" />
        <span>Business Listing</span><i className="fas fa-chevron-right" />
        <span>{business.name}</span>
      </nav>

      <section className="business-detail-hero">
        <div className="business-detail-cover">
          {business.coverUrl || business.logoUrl ? (
            <img src={business.coverUrl || business.logoUrl || ""} alt={business.name} />
          ) : (
            <div className="result-card-placeholder">{business.name.slice(0, 1)}</div>
          )}
        </div>
        <div className="business-detail-summary">
          <h1>{business.name} <span><i className="fas fa-check" /> Verified</span></h1>
          <div className="business-detail-rating">
            <span>★★★★★</span><strong>{summary.formatted}</strong><small>{summary.count} total ratings</small>
          </div>
          <h2>{business.address}, {business.city}, {business.state} {business.pincode}</h2>
          <p>Listed on Bulalo.in since {business.createdAt.toLocaleDateString("en-IN", { year: "numeric", month: "long" })}</p>
          <div className="business-detail-actions">
            <Link href={`tel:${business.phone}`}><i className="fas fa-phone" /> {business.phone}</Link>
            <Link href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="whatsapp"><i className="fab fa-whatsapp" /> Chat</Link>
            {business.website ? <Link href={business.website} target="_blank" rel="noreferrer"><i className="fas fa-globe" /> Website</Link> : null}
          </div>
        </div>
      </section>

      <section className="business-detail-grid">
        <article className="business-detail-panel">
          <h2>Categories</h2>
          <div className="result-tags">
            {business.categories.map((item) => (
              <Link key={item.id} href={`/category/${item.mainCategory.slug}`}>{item.mainCategory.name}</Link>
            ))}
          </div>
          <h2>About this business</h2>
          <p>{business.description || `${business.name} is listed on Bulalo.in. Contact the business directly for services, pricing, and availability.`}</p>
        </article>

        <aside className="business-detail-panel">
          <h2>Address & Communication</h2>
          <p><i className="fas fa-map-marker-alt" /> {business.address}</p>
          <p>City: {business.city}, {business.pincode}</p>
          <p>State: {business.state}, India</p>
          {business.email ? <p>Email: <Link href={`mailto:${business.email}`}>{business.email}</Link></p> : null}
          {business.website ? <p>Website: <Link href={business.website}>{business.website}</Link></p> : null}
        </aside>
      </section>

      <RatingForm businessId={business.id} initialAverage={summary.average} initialCount={summary.count} />
    </main>
  );
}
