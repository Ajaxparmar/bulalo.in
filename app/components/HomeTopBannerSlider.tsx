"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type HeaderSlide = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  imageUrl?: string;
  imageAlt?: string;
  href: string;
  tone?: string;
};

export default function HomeTopBannerSlider({ slides }: { slides: HeaderSlide[] }) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (slides.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  function moveSlide(direction: number) {
    setActiveSlide((current) => (current + direction + slides.length) % slides.length);
  }

  return (
    <div className="home-promo-slider">
      {slides.map((slide, index) => (
        <Link
          key={slide.id}
          href={slide.href}
          className={`home-promo-placeholder ${slide.tone || ""} ${index === activeSlide ? "active" : ""}`}
          aria-hidden={index !== activeSlide}
          tabIndex={index === activeSlide ? 0 : -1}
          style={slide.imageUrl ? { backgroundImage: `url("${slide.imageUrl}")` } : undefined}
        >
          {slide.imageUrl ? <span className="home-promo-image-shade" /> : null}
          <div>
            <span>{slide.eyebrow}</span>
            <h2>{slide.title}</h2>
            <p>{slide.detail}</p>
          </div>
          {!slide.imageUrl ? <i className="far fa-image" aria-hidden="true" /> : null}
          {slide.imageUrl ? <span className="sr-only">{slide.imageAlt || slide.title}</span> : null}
        </Link>
      ))}

      {slides.length > 1 ? (
        <>
          <button type="button" className="home-promo-arrow previous" onClick={() => moveSlide(-1)} aria-label="Previous slide">
            <i className="fas fa-chevron-left" />
          </button>
          <button type="button" className="home-promo-arrow next" onClick={() => moveSlide(1)} aria-label="Next slide">
            <i className="fas fa-chevron-right" />
          </button>
          <div className="home-promo-dots">
            {slides.map((slide, index) => (
              <button
                type="button"
                key={slide.id}
                className={index === activeSlide ? "active" : ""}
                onClick={() => setActiveSlide(index)}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
