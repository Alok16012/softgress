// Small, dependency-free time-zone helpers built on Intl.

function partsIn(tz: string, date: Date) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
  });
  const p = Object.fromEntries(f.formatToParts(date).map((x) => [x.type, x.value]));
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    second: Number(p.second),
    weekday: p.weekday as string,
  };
}

/** Offset (ms) of `tz` from UTC at the given instant. */
export function tzOffsetMs(tz: string, date: Date): number {
  const p = partsIn(tz, date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** Convert a wall-clock time in `tz` to a UTC Date. */
export function zonedToUtc(tz: string, y: number, m: number, d: number, h: number, min: number): Date {
  const guess = new Date(Date.UTC(y, m - 1, d, h, min));
  const off1 = tzOffsetMs(tz, guess);
  const first = new Date(guess.getTime() - off1);
  const off2 = tzOffsetMs(tz, first);
  return off1 === off2 ? first : new Date(guess.getTime() - off2);
}

export function localDateParts(tz: string, date: Date) {
  return partsIn(tz, date);
}

export function formatInZone(iso: string, tz: string, locale = "en-IN") {
  return new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
}
