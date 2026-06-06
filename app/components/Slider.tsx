'use client';

import Link from 'next/link';
import Image from 'next/image';

const categories = [
  { name: "Auto Agency", img: "/images/auto-agency-abhi-khojo.png", href: "/sub-category/Auto-Agency" },
  { name: "Cycle Shop", img: "/images/cycle-shop-abhi-khojo-sub-c.png", href: "/sub-category/Cycle-Shop" },
  { name: "Animal Hospitals", img: "/images/Animal-doctor.png", href: "/sub-category/Animal-Hospitals" },
  { name: "Property", img: "/images/property-Deal.png", href: "/sub-category/Property" },
  { name: "Beauty Saloon", img: "/images/Beauty-parlour.jpg", href: "/sub-category/Beauty-Saloon" },
  // Add more as needed
];

export default function Sidebar() {
  return (
    <div className="hidden lg:block w-64 bg-white border-r p-4">
      <h3 className="font-semibold text-lg mb-4 text-gray-800">Popular Categories</h3>
      
      <div className="space-y-3">
        {categories.map((cat, index) => (
          <Link
            key={index}
            href={cat.href}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <div className="w-10 h-10 relative">
              <Image
                src={cat.img}
                alt={cat.name}
                fill
                className="object-contain"
              />
            </div>
            <span className="font-medium text-sm">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}