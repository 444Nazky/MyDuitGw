import type { CurrencyCode } from './types';

export const USD_TO_IDR = 16300;

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

function groupDigits(value: string, separator: string): string {
  const [whole, fraction] = value.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return fraction ? `${grouped}${separator === '.' ? ',' : '.'}${fraction}` : grouped;
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  const absolute = Math.abs(amount);
  if (currency === 'IDR') {
    return `Rp ${groupDigits(String(Math.round(absolute * USD_TO_IDR)), '.')}`;
  }
  return `$${groupDigits(absolute.toFixed(2), ',')}`;
}

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
  return `${MONTHS[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
}

export function formatDateTime(iso: string): string {
  return `${formatShortDate(iso)} · ${formatClockTime(iso)}`;
}

export function monthKey(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export function monthLabel(date: Date): string {
  return MONTHS[date.getMonth()];
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function toAmount(value: number | string): number {
  const amount = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}
