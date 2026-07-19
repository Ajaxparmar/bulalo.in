import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["contact_title", "contact_body", "contact_phone", "contact_email", "contact_address", "contact_map_location"] } },
  });
  const value = (key: string, fallback: string) =>
    settings.find((setting) => setting.key === key)?.value || fallback;
  const phone = value("contact_phone", "+91 98128 66228");
  const email = value("contact_email", "help@bulalo.in");
  const mailToEmail = email.split(/[,\s]+/).find(Boolean) || "help@bulalo.in";
  const address = value("contact_address", "Jind, Haryana, India");
  const mapLocation = value("contact_map_location", address);
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapLocation)}&output=embed`;

  return (
    <main className="content-page">
      <section className="content-page-panel contact-page-panel">
        <p className="eyebrow">Contact Bulalo.in</p>
        <h1>{value("contact_title", "How can we help?")}</h1>
        <div className="content-page-copy">
          <p>{value("contact_body", "Contact us for listing support, account help, payments, or general questions.")}</p>
        </div>
        <div className="contact-detail-grid">
          <Link href={`tel:${phone.replace(/[^\d+]/g, "")}`}><i className="fas fa-phone" /><span><small>Phone</small>{phone}</span></Link>
          <Link href={`mailto:${mailToEmail}`}><i className="fas fa-envelope" /><span><small>Email</small>{email}</span></Link>
          <div><i className="fas fa-map-marker-alt" /><span><small>Address</small>{address}</span></div>
        </div>
        <div className="contact-map">
          <iframe
            src={mapSrc}
            title="Bulalo.in office location"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>
    </main>
  );
}
