import { describe, it, expect, vi, afterEach } from 'vitest';
import { bucketize, buildWeeks, levelColor, formatMonthYear, yearsSince } from './contributions';

afterEach(() => {
  vi.useRealTimers();
});

describe('bucketize', () => {
  it('assigns level 0 to zero counts and spreads the rest across quartiles', () => {
    const counts = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8];
    const levels = bucketize(counts);
    expect(levels[0]).toBe(0);
    expect(levels[1]).toBe(0);
    expect(Math.max(...levels)).toBe(4);
    expect(levels.every((l) => l >= 0 && l <= 4)).toBe(true);
  });

  it('returns all zeros when every count is zero', () => {
    expect(bucketize([0, 0, 0])).toEqual([0, 0, 0]);
  });
});

describe('levelColor', () => {
  it('returns the heat ramp color for each level', () => {
    expect(levelColor(0)).toBe('#161D28');
    expect(levelColor(1)).toBe('rgba(74,222,128,.22)');
    expect(levelColor(2)).toBe('rgba(74,222,128,.45)');
    expect(levelColor(3)).toBe('rgba(74,222,128,.72)');
    expect(levelColor(4)).toBe('#4ADE80');
  });
});

describe('buildWeeks', () => {
  it('groups days into 7-day weeks in order', () => {
    const days = Array.from({ length: 14 }, (_, i) => ({
      date: `2025-01-${String(i + 1).padStart(2, '0')}`,
      count: i,
    }));
    const weeks = buildWeeks(days);
    expect(weeks).toHaveLength(2);
    expect(weeks[0].days).toHaveLength(7);
    expect(weeks[1].days[0].date).toBe('2025-01-08');
  });
});

describe('formatMonthYear', () => {
  it('formats an ISO date as lowercase "mon yyyy"', () => {
    expect(formatMonthYear('2025-07-26')).toBe('jul 2025');
  });
});

describe('yearsSince', () => {
  it('counts a full year once the anniversary date has passed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-25T00:00:00Z'));
    expect(yearsSince('2017-01-01T00:00:00Z')).toBe(9);
  });

  it('does not count the current year until the anniversary date arrives', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-25T00:00:00Z'));
    expect(yearsSince('2017-12-31T00:00:00Z')).toBe(8);
  });
});
