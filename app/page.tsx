import HomeShowcase from "@/app/components/HomeShowcase";
import HomeTopBanner from "@/app/components/HomeTopBanner";
import HomeBottomCards from "@/app/components/HomeBottomCards";


export default function Home() {
  return (
    <main className="home-page">
      <HomeTopBanner />
      <HomeShowcase />
      <HomeBottomCards />
    </main>
  );
}
