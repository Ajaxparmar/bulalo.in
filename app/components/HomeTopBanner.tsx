"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const topCategories = [
  { name: "Equipment", href: "/category/equipment", icon: "fas fa-tools" },
  { name: "Catering Services", href: "/category/catering-services", icon: "fas fa-utensils" },
  { name: "Real Estate", href: "/category/real-estate", icon: "fas fa-home" },
];

const promoSlides = [
  {
    eyebrow: "Featured banner",
    title: "Add your medical promotional image",
    detail: "Recommended size: 1200 × 520 px",
    href: "/category/medical",
    tone: "medical",
  },
  {
    eyebrow: "Home services",
    title: "Add your home decor promotional image",
    detail: "Recommended size: 1200 × 520 px",
    href: "/category/home-decor",
    tone: "home",
  },
  {
    eyebrow: "Local shopping",
    title: "Add your grocery promotional image",
    detail: "Recommended size: 1200 × 520 px",
    href: "/category/grocery",
    tone: "grocery",
  },
  {
    eyebrow: "Move with confidence",
    title: "Add your packers and movers image",
    detail: "Recommended size: 1200 × 520 px",
    href: "/category/packers-and-movers",
    tone: "moving",
  },
];

export default function HomeTopBanner() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % promoSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  function moveSlide(direction: number) {
    setActiveSlide((current) => (current + direction + promoSlides.length) % promoSlides.length);
  }

  return (
    <section className="home-top-banner" aria-label="Featured categories and promotion">
      <div className="home-top-category-grid">
        {topCategories.map((category) => (
          <Link key={category.name} href={category.href} className="home-top-category-card">
            <div className="home-top-placeholder">
              <i className={category.icon} />
              <span>Add category image</span>
            </div>
            <h2>{category.name}</h2>
          </Link>
        ))}
      </div>

      <div className="home-promo-slider">
        {promoSlides.map((slide, index) => (
          <Link
            key={slide.title}
            href={slide.href}
            className={`home-promo-placeholder ${slide.tone} ${index === activeSlide ? "active" : ""}`}
            aria-hidden={index !== activeSlide}
            tabIndex={index === activeSlide ? 0 : -1}
          >
            <div>
              <span>{slide.eyebrow}</span>
              <h2>{slide.title}</h2>
              <p>{slide.detail}</p>
            </div>
            <i className="far fa-image" aria-hidden="true" />
          </Link>
        ))}
        <button type="button" className="home-promo-arrow previous" onClick={() => moveSlide(-1)} aria-label="Previous slide">
          <i className="fas fa-chevron-left" />
        </button>
        <button type="button" className="home-promo-arrow next" onClick={() => moveSlide(1)} aria-label="Next slide">
          <i className="fas fa-chevron-right" />
        </button>
        <div className="home-promo-dots">
          {promoSlides.map((slide, index) => (
            <button
              type="button"
              key={slide.title}
              className={index === activeSlide ? "active" : ""}
              onClick={() => setActiveSlide(index)}
              aria-label={`Show slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
