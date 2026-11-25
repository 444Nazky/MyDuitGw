import type { CurrencyCode } from '@/types/finance';

export const USD_TO_IDR = 16300;

function groupDigits(value: string, separator: string): string {
  const [whole, fraction] = value.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return fraction ? `${grouped}${separator === '.' ? ',' : '.'}${fraction}` : grouped;
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  const absolute = Math.abs(amount);

  if (currency === 'IDR') {
    const converted = Math.round(absolute * USD_TO_IDR);
    return `Rp ${groupDigits(String(converted), '.')}`;
  }

  return `$${groupDigits(absolute.toFixed(2), ',')}`;
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatClockTime(iso: string): string {
  const date = new Date(iso);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${minutes} ${period}`;
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  return `${MONTHS[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}`;
}

export function formatMediumDate(iso: string): string {
  const date = new Date(iso);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatDateTime(iso: string): string {
  return `${formatShortDate(iso)} · ${formatClockTime(iso)}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

export function isCurrentMonth(date: Date): boolean {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'NN';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** Turns typed digits into a display string without changing the value. */
export function formatAmountInput(raw: string, currency: CurrencyCode): string {
  if (currency === 'IDR') {
    const digits = raw.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '');
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  const cleaned = raw.replace(/[^0-9.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  const fraction = rest.join('').slice(0, 2);
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const trimmedWhole = grouped.replace(/^0+(?=\d)/, '');
  return fraction.length > 0 || cleaned.endsWith('.')
    ? `${trimmedWhole || '0'}.${fraction}`
    : trimmedWhole;
}

export function parseAmountInput(display: string, currency: CurrencyCode): number {
  const parsed =
    currency === 'IDR'
      ? Number(display.replace(/\./g, ''))
      : Number(display.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}
