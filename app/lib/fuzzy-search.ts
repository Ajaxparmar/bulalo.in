function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function levenshtein(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + substitutionCost,
      );
    }

    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length];
}

export function fuzzyScore(queryValue: string, candidateValue: string) {
  const query = normalize(queryValue);
  const candidate = normalize(candidateValue);

  if (!query || !candidate) {
    return 0;
  }

  if (candidate === query) {
    return 100;
  }

  if (candidate.startsWith(query)) {
    return 92;
  }

  const candidateWords = candidate.split(" ");
  const queryWords = query.split(" ");

  if (queryWords.every((queryWord) => candidateWords.some((word) => word.startsWith(queryWord)))) {
    return 88;
  }

  if (query.length >= 3 && candidate.includes(query)) {
    return 80;
  }

  if (query.length < 3) {
    return 0;
  }

  let matchedWords = 0;

  for (const queryWord of queryWords) {
    const allowedDistance = queryWord.length >= 7 ? 2 : 1;
    const matched = candidateWords.some((candidateWord) => {
      const comparable = candidateWord.slice(0, Math.max(queryWord.length, candidateWord.length));
      return levenshtein(queryWord, comparable) <= allowedDistance;
    });

    if (matched) {
      matchedWords += 1;
    }
  }

  return matchedWords === queryWords.length ? 70 + matchedWords : 0;
}
