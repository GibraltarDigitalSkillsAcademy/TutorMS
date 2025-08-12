import { DateTime } from 'luxon';

/**
 * Convert a local ISO datetime string in a specific timezone
 * to a UTC ISO string for storage in Prisma
 */
export function toUTCISOStringFromLocal(localIso: string, timezone: string): string {
  return DateTime.fromISO(localIso, { zone: timezone }).toUTC().toISO();
}


export function toUTCString(date: Date) {
  const template = "2000-01-01T00:00:00Z"
  const date_len = date.length
  return date.slice(0, date_len) + template.slice(date_len)
}