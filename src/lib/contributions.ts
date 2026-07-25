export interface Day {
  date: string;
  count: number;
  level: number;
}

export interface Week {
  days: Day[];
}

const HEAT_RAMP = [
  '#161D28',
  'rgba(74,222,128,.22)',
  'rgba(74,222,128,.45)',
  'rgba(74,222,128,.72)',
  '#4ADE80',
];

export function levelColor(level: number): string {
  return HEAT_RAMP[level];
}

export function bucketize(counts: number[]): number[] {
  const nonZero = counts.filter((c) => c > 0).sort((a, b) => a - b);
  if (nonZero.length === 0) return counts.map(() => 0);

  const quantile = (p: number) =>
    nonZero[Math.min(nonZero.length - 1, Math.floor(p * nonZero.length))];
  const t1 = quantile(0.25);
  const t2 = quantile(0.5);
  const t3 = quantile(0.75);

  return counts.map((c) => {
    if (c === 0) return 0;
    if (c <= t1) return 1;
    if (c <= t2) return 2;
    if (c <= t3) return 3;
    return 4;
  });
}

export function buildWeeks(days: { date: string; count: number }[]): Week[] {
  const levels = bucketize(days.map((d) => d.count));
  const withLevels: Day[] = days.map((d, i) => ({ ...d, level: levels[i] }));

  const weeks: Week[] = [];
  for (let i = 0; i < withLevels.length; i += 7) {
    weeks.push({ days: withLevels.slice(i, i + 7) });
  }
  return weeks;
}

export function formatMonthYear(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toLowerCase();
}
