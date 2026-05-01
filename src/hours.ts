import type { HoursStructured } from './types';

const DAY_KEYS: Array<keyof HoursStructured> = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function isAfterHours(hours: HoursStructured | undefined, date: Date = new Date()): boolean {
  if (!hours) return false;
  const dayKey = DAY_KEYS[date.getDay()];
  const window = hours[dayKey];
  if (!window || window === 'closed') return true;

  const match = window.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
  if (!match) return false;
  const [, oh, om, ch, cm] = match;
  const now = date.getHours() * 60 + date.getMinutes();
  const open = Number(oh) * 60 + Number(om);
  const close = Number(ch) * 60 + Number(cm);
  return now < open || now >= close;
}

export function greetingForTime(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
