// Allow letters (Latin + Cyrillic + Uzbek), digits, spaces, hyphens, commas
const DISTRICT_RE = /^[\p{L}\d\s,\-]+$/u;

export function sanitizeDistrict(value: string): string | null {
  const trimmed = value.trim().slice(0, 100);
  if (!trimmed || !DISTRICT_RE.test(trimmed)) return null;
  return trimmed;
}
