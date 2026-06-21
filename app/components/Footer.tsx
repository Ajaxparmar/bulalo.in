import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

export default async function Footer() {
  const popularCategories = await prisma.footerPopularCategory.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take: 8,
    include: { mainCategory: { select: { name: true, slug: true, isActive: true } } },
  });

  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold text-lg mb-4">Popular Categories</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {popularCategories
                .filter((entry) => entry.mainCategory.isActive)
                .map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/category/${entry.mainCategory.slug}`}
                    className="hover:text-orange-400"
                  >
                    {entry.mainCategory.name}
                  </Link>
                ))}
              {popularCategories.length === 0 ? <span>Categories coming soon</span> : null}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link href="/" className="hover:text-orange-400 block">Home</Link>
              <Link href="/about" className="hover:text-orange-400 block">About Us</Link>
              <Link href="/contact-us" className="hover:text-orange-400 block">Contact Us</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">About & Policies</h4>
            <div className="space-y-2 text-sm">
              <Link href="/about/terms" className="hover:text-orange-400 block">Terms & Conditions</Link>
              <Link href="/about/privacy" className="hover:text-orange-400 block">Privacy Policy</Link>
              <Link href="/about/refund" className="hover:text-orange-400 block">Refund Policy</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <Link href="https://facebook.com/bulalo.in" target="_blank" className="hover:text-orange-400"><i className="fab fa-facebook-f text-2xl" /></Link>
              <Link href="https://instagram.com/bulalo.in" target="_blank" className="hover:text-orange-400"><i className="fab fa-instagram text-2xl" /></Link>
              <Link href="https://twitter.com/bulalo.in" target="_blank" className="hover:text-orange-400"><i className="fab fa-twitter text-2xl" /></Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm">
          <p>Made with ❤️ by <Link href="https://codescaler.com" className="text-orange-400">codescaler</Link></p>
          <p className="mt-1">© 2026 Bulalo.in. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
