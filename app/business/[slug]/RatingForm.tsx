"use client";

import { useState } from "react";

export default function RatingForm({
  businessId,
  initialAverage,
  initialCount,
}: {
  businessId: string;
  initialAverage: number;
  initialCount: number;
}) {
  const [selected, setSelected] = useState(0);
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialCount);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitRating(rating: number) {
    setSelected(rating);
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/businesses/${businessId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Unable to save your rating.");
        return;
      }

      setAverage(result.average);
      setCount(result.count);
      setMessage(result.updated ? "Your rating was updated." : "Thank you for rating this shop.");
    } catch {
      setMessage("Unable to save your rating. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="business-rating-panel">
      <div>
        <h2>Rate this shop</h2>
        <p><strong>{average.toFixed(1)}</strong> from {count} rating{count === 1 ? "" : "s"}</p>
      </div>
      <div className="business-rating-buttons" aria-label="Choose a rating">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            className={rating <= selected ? "selected" : ""}
            disabled={loading}
            onClick={() => submitRating(rating)}
            aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
          >
            ★
          </button>
        ))}
      </div>
      {message ? <p className="rating-message" role="status">{message}</p> : null}
    </section>
  );
}
