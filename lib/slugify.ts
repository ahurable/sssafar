// lib/slugify.ts
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF\-]+/g, '') // Keep Persian/Arabic characters
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function generateUniqueSlug(baseText: string, existingSlugs: (string | null)[] | { slug: string }[]): string {
  let slug = slugify(baseText);
  let uniqueSlug = slug;
  let counter = 1;

  if (!existingSlugs || existingSlugs.length === 0) {
    return uniqueSlug;
  }

  // Helper function to check if a slug exists
  const slugExists = (testSlug: string): boolean => {
    return existingSlugs.some(item => {
      if (typeof item === 'string') {
        return item === testSlug;
      } else if (item && typeof item === 'object' && 'slug' in item) {
        return item.slug === testSlug;
      }
      return false;
    });
  };

  while (slugExists(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}