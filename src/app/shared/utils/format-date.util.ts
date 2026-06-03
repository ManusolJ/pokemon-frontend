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

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86_400;
const SECONDS_PER_WEEK = 604_800;
const SECONDS_PER_MONTH = 2_629_800;
const SECONDS_PER_YEAR = 31_557_600;

interface RelativeUnit {
  readonly unit: Intl.RelativeTimeFormatUnit;
  readonly secondsPer: number;
}

const RELATIVE_UNITS: readonly RelativeUnit[] = [
  { unit: 'year', secondsPer: SECONDS_PER_YEAR },
  { unit: 'month', secondsPer: SECONDS_PER_MONTH },
  { unit: 'week', secondsPer: SECONDS_PER_WEEK },
  { unit: 'day', secondsPer: SECONDS_PER_DAY },
  { unit: 'hour', secondsPer: SECONDS_PER_HOUR },
  { unit: 'minute', secondsPer: SECONDS_PER_MINUTE },
];

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
const JUST_NOW_LABEL = 'just now';
const MILLISECONDS_PER_SECOND = 1000;

export function formatJoinDate(iso: string | undefined, style: 'long' | 'short' = 'long'): string {
  const date = parseIso(iso);
  if (!date) {
    return EMPTY_DATE_PLACEHOLDER;
  }
  const options = style === 'short' ? SHORT_DATE_FORMAT_OPTIONS : LONG_DATE_FORMAT_OPTIONS;
  return date.toLocaleDateString(undefined, options);
}

export function formatRelativeDate(iso: string | undefined): string {
  const date = parseIso(iso);
  if (!date) {
    return EMPTY_DATE_PLACEHOLDER;
  }

  const deltaSeconds = (date.getTime() - Date.now()) / MILLISECONDS_PER_SECOND;
  const absSeconds = Math.abs(deltaSeconds);
  if (absSeconds < SECONDS_PER_MINUTE) {
    return JUST_NOW_LABEL;
  }

  for (const { unit, secondsPer } of RELATIVE_UNITS) {
    if (absSeconds >= secondsPer) {
      const value = Math.round(deltaSeconds / secondsPer);
      return RELATIVE_TIME_FORMATTER.format(value, unit);
    }
  }

  return JUST_NOW_LABEL;
}

function parseIso(iso: string | undefined): Date | null {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}
