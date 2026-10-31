import { STATS } from '@shared/constants/stat.constants';

export function statLabel(raw: string): string {
  const compact = raw.toLowerCase().replace(/[-_\s]/g, '');
  const known = STATS.find((stat) => stat.key.toLowerCase() === compact);
  if (known) {
    return known.label;
  }
  return raw
    .toLowerCase()
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
