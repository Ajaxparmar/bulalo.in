import Link from "next/link";
import { ratingSummary } from "@/app/lib/rating";

type ListingBusiness = {
  id: string;
  slug: string;
  name: string;
  coverUrl: string | null;
  logoUrl: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  description: string | null;
  isTopListing: boolean | null;
  createdAt: Date;
  categories: {
    mainCategory: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  ratings: { rating: number }[];
};

export default function BusinessListingCard({ business }: { business: ListingBusiness }) {
  const summary = ratingSummary(business.ratings);
  const primaryCategory = business.categories[0]?.mainCategory;

  return (
    <article className="result-card">
      <Link href={`/business/${business.slug}`} className="result-card-detail-link">
        <div className="result-card-media">
          {business.coverUrl || business.logoUrl ? (
            <img
              className="result-card-image"
              src={business.coverUrl || business.logoUrl || ""}
              alt={business.name}
            />
          ) : (
            <div className="result-card-placeholder">{business.name.slice(0, 1)}</div>
          )}
          {primaryCategory ? <span className="result-card-category">{primaryCategory.name}</span> : null}
        </div>

        <div className="result-card-body">
          <h2>
            {business.name} <span><i className="fas fa-check" /> Verified</span>
          </h2>
          {business.isTopListing ? <p className="result-top-listing"><i className="fas fa-star" /> Top Listing</p> : null}
          <div className="result-rating-row">
            <span className="result-rating-stars" aria-label={`${summary.formatted} out of 5 stars`}>
              {"★★★★★"}
            </span>
            <strong>{summary.count > 0 ? summary.formatted : "New"}</strong>
            <small>{summary.count} rating{summary.count === 1 ? "" : "s"}</small>
          </div>
          <p className="result-address">
            {business.address}, {business.city}, {business.state} {business.pincode}
          </p>
          <div className="result-tags">
            {business.categories.map((item) => (
              <span key={item.mainCategory.id}>{item.mainCategory.name}</span>
            ))}
          </div>
          {business.description ? (
            <p className="result-description">
              <i className="far fa-comment-dots" /> {business.description}
            </p>
          ) : null}
        </div>
      </Link>

      <div className="result-card-actions">
        <Link href={`tel:${business.phone}`} className="result-call-button">
          <i className="fas fa-phone" /> Show Number
        </Link>
        <Link href={`/business/${business.slug}`} className="result-details-button">View details</Link>
      </div>
    </article>
  );
}
