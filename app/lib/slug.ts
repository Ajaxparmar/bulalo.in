export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uniqueSlug(value: string) {
  const slug = slugify(value);
  return `${slug}-${Date.now().toString(36)}`;
}
