const EMPTY_DATE_PLACEHOLDER = '—';

const LONG_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

const SHORT_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

export function formatJoinDate(iso: string | undefined, style: 'long' | 'short' = 'long'): string {
  if (!iso) {
    return EMPTY_DATE_PLACEHOLDER;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return EMPTY_DATE_PLACEHOLDER;
  }
  const options = style === 'short' ? SHORT_DATE_FORMAT_OPTIONS : LONG_DATE_FORMAT_OPTIONS;
  return date.toLocaleDateString(undefined, options);
}
