import { describe, it, expect } from 'vitest';
import { bucketize, buildWeeks, levelColor, formatMonthYear } from './contributions';

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
  it('groups days into 7-day weeks in order when the range starts on a Sunday', () => {
    // 2025-01-05 is a Sunday
    const days = Array.from({ length: 14 }, (_, i) => ({
      date: `2025-01-${String(i + 5).padStart(2, '0')}`,
      count: i,
    }));
    const weeks = buildWeeks(days);
    expect(weeks).toHaveLength(2);
    expect(weeks[0].days).toHaveLength(7);
    expect(weeks[1].days[0]?.date).toBe('2025-01-12');
  });

  it('pads the first week with nulls so days stay aligned to their weekday row', () => {
    // 2025-01-01 is a Wednesday, so the first week needs 3 leading empty cells
    const days = Array.from({ length: 2 }, (_, i) => ({
      date: `2025-01-0${i + 1}`,
      count: i,
    }));
    const weeks = buildWeeks(days);
    expect(weeks).toHaveLength(1);
    expect(weeks[0].days).toHaveLength(5);
    expect(weeks[0].days.slice(0, 3)).toEqual([null, null, null]);
    expect(weeks[0].days[3]?.date).toBe('2025-01-01');
    expect(weeks[0].days[4]?.date).toBe('2025-01-02');
  });
});

describe('formatMonthYear', () => {
  it('formats an ISO date as lowercase "mon yyyy"', () => {
    expect(formatMonthYear('2025-07-26')).toBe('jul 2025');
  });
});
