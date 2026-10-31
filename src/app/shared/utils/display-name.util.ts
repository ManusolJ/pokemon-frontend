export function displayName(slug: string): string {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
