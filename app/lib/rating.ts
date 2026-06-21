export function ratingSummary(ratings: { rating: number }[]) {
  const count = ratings.length;
  const average = count > 0
    ? ratings.reduce((total, item) => total + item.rating, 0) / count
    : 0;

  return {
    count,
    average,
    formatted: average.toFixed(1),
  };
}
