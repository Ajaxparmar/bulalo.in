import HomeShowcase from "@/app/components/HomeShowcase";
import HomeTopBanner from "@/app/components/HomeTopBanner";


export default function Home() {
  return (
    <main className="home-page">
      <HomeTopBanner />
      <HomeShowcase />
    </main>
  );
}
