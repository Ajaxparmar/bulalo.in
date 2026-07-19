import HomeShowcase from "@/app/components/HomeShowcase";
import HomeTopBanner from "@/app/components/HomeTopBanner";
import HomeBottomCards from "@/app/components/HomeBottomCards";


export default function Home() {
  return (
    <main className="home-page">
      <HomeTopBanner />
      <HomeShowcase />
      <HomeBottomCards />
      <section className="home-about-summary">
        <h2>About Us - Bulalo.in</h2>
        <p>
          Welcome to Bulalo.in. Business listings and online discovery platforms like Bulalo.in play a crucial role in helping people find local services, products, and businesses on the internet. These platforms typically provide the following benefits: Convenience: Users can easily search for businesses and services online, saving time and effort.
        </p>
        <p><strong>Variety:</strong> They offer a wide range of businesses and services, allowing users to explore different options.</p>
        <p><strong>Reviews and Ratings:</strong> Users can often read reviews and ratings from other customers to make informed decisions.</p>
        <p><strong>Contact information:</strong> Users can find contact details, addresses, and hours of operation for businesses.</p>
        <p><strong>Promotion:</strong> Businesses can promote themselves to a larger audience, increasing their visibility.</p>
        <p><strong>Location-Based:</strong> Many platforms use location-based services to show businesses near the user&apos;s location.</p>
        <p><strong>Categories:</strong> Businesses are categorized, making it easier for users to find what they need.</p>
      </section>
    </main>
  );
}
