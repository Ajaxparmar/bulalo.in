"use client";

import Image from "next/image";
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
        <div
          key={slide.id}
          className={`home-promo-placeholder ${slide.imageUrl ? "has-image" : ""} ${slide.tone || ""} ${index === activeSlide ? "active" : ""}`}
          aria-hidden={index !== activeSlide}
        >
          {slide.imageUrl ? (
            <Image
              className="home-promo-image"
              src={slide.imageUrl}
              alt={slide.imageAlt || slide.title}
              fill
              sizes="(max-width: 700px) 100vw, (max-width: 1200px) 100vw, 58vw"
              priority={index === 0}
            />
          ) : (
            <>
              <div>
                <span>{slide.eyebrow}</span>
                <h2>{slide.title}</h2>
                <p>{slide.detail}</p>
              </div>
              <i className="far fa-image" aria-hidden="true" />
            </>
          )}
        </div>
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
