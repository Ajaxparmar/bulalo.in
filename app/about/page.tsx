import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["about_title", "about_body"] } },
  });
  const value = (key: string, fallback: string) =>
    settings.find((setting) => setting.key === key)?.value || fallback;

  return (
    <main className="content-page">
      <section className="content-page-panel">
        <p className="eyebrow">About Bulalo.in</p>
        <h1>{value("about_title", "Helping people discover trusted local businesses")}</h1>
        <div className="content-page-copy">
          {value(
            "about_body",
            "Bulalo.in connects customers with local shops and service providers. Our directory helps businesses become easier to discover while giving visitors a simple way to find services near them.",
          ).split(/\n{2,}/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="content-page-copy about-bottom-copy">
          <h2>About Us - Bulalo.in</h2>
          <p>
            <strong>Welcome to Bulalo.in.</strong> Business listings and online discovery platforms like Bulalo.in play a crucial role in helping people find local services, products, and businesses on the internet. These platforms typically provide the following benefits:
          </p>
          <p>
            <strong>Convenience:</strong> Users can easily search for businesses and services online, saving time and effort.
          </p>
          <p>
            <strong>Variety:</strong> They offer a wide range of businesses and services, allowing users to explore different options.
          </p>
          <p>
            <strong>Reviews and Ratings:</strong> Users can often read reviews and ratings from other customers to make informed decisions.
          </p>
          <p>
            <strong>Contact information:</strong> Users can find contact details, addresses, and hours of operation for businesses.
          </p>
          <p>
            <strong>Promotion:</strong> Businesses can promote themselves to a larger audience, increasing their visibility.
          </p>
          <p>
            <strong>Location-Based:</strong> Many platforms use location-based services to show businesses near the user&apos;s location.
          </p>
          <p>
            <strong>Categories:</strong> Businesses are categorized, making it easier for users to find what they need.
          </p>
        </div>
      </section>
    </main>
  );
}
