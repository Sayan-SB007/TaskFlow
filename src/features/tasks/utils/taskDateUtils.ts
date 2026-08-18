export function parseTaskDate(value?: string): Date | null {
  if (!value) return null;

  if (value.trim().toLowerCase() === 'today') {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  const nativeDate = new Date(value);
  if (!Number.isNaN(nativeDate.getTime())) {
    return new Date(
      nativeDate.getFullYear(),
      nativeDate.getMonth(),
      nativeDate.getDate(),
    );
  }

  const parts = value.trim().split(/\s+/);
  if (parts.length !== 3) return null;

  const day = Number(parts[0]);
  const month = parts[1];
  const year = Number(parts[2]);
  const months = [
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
  const monthIndex = months.findIndex(
    item => item.toLowerCase() === month.toLowerCase(),
  );

  if (!Number.isFinite(day) || monthIndex < 0 || !Number.isFinite(year)) {
    return null;
  }

  return new Date(year, monthIndex, day);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function isToday(value?: string): boolean {
  const date = parseTaskDate(value);
  return !!date && isSameDay(date, new Date());
}
