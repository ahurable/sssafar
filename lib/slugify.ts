// lib/slugify.ts
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function generateUniqueSlug(baseText: string, existingSlugs: (string|null)[]): string {
  let slug = slugify(baseText);
  let uniqueSlug = slug;
  let counter = 1;

  if (!existingSlugs) {
    return uniqueSlug
  }

  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}