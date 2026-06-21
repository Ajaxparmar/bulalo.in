"use client";

import Link from "next/link";
import { useRef } from "react";

export type BottomCard = {
  id: string;
  title: string;
  href: string;
  imageUrl?: string;
  imageAlt?: string;
  icon?: string;
};

export default function HomeBottomCardSlider({ cards }: { cards: BottomCard[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function slide(direction: number) {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    track.scrollBy({
      left: direction * Math.max(track.clientWidth * 0.85, 240),
      behavior: "smooth",
    });
  }

  return (
    <div className="home-bottom-slider">
      <button type="button" className="home-bottom-arrow previous" onClick={() => slide(-1)} aria-label="Previous category cards">
        <i className="fas fa-chevron-left" />
      </button>
      <div ref={trackRef} className="home-bottom-card-track">
        {cards.map((card) => (
          <Link key={card.id} href={card.href} className="home-bottom-card">
            {card.imageUrl ? (
              <img src={card.imageUrl} alt={card.imageAlt || card.title} />
            ) : (
              <span className="home-bottom-card-placeholder">
                <i className={card.icon} />
                <small>Add category image</small>
              </span>
            )}
            <h2>{card.title}</h2>
          </Link>
        ))}
      </div>
      <button type="button" className="home-bottom-arrow next" onClick={() => slide(1)} aria-label="Next category cards">
        <i className="fas fa-chevron-right" />
      </button>
    </div>
  );
}
