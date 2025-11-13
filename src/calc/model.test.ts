import { describe, expect, it } from 'vitest';
import { computeSimulation } from './model';
import type { SimulationState } from '../types';

const BASE_GLOBAL = {
  blockSizeBytes: 2 * 1024 * 1024,
  blockTimeSeconds: 75,
  lanePct: 10,
  units: 'binary' as const,
};

const SINGLE_L2 = {
  id: 'l2',
  label: 'Payments',
  tps: 10_000,
  settlementCadenceSeconds: 6 * 3_600,
  proofSizeBytes: 50 * 1024,
};

describe('computeSimulation', () => {
  it('matches acceptance criteria for single L2', () => {
    const state: SimulationState = {
      global: BASE_GLOBAL,
      l2s: [SINGLE_L2],
    };
    const { perL2, totals } = computeSimulation(state);
    expect(perL2[0].avgBytesPerBlock).toBeCloseTo(178, 0);
    expect(perL2[0].avgSharePct).toBeCloseTo(0.0085, 3);
    expect(totals.dailyBlocks).toBeCloseTo(0.1, 1);
  });

  it('handles 20 L2 preset aggregate', () => {
    const state: SimulationState = {
      global: BASE_GLOBAL,
      l2s: Array.from({ length: 20 }).map((_, idx) => ({
        ...SINGLE_L2,
        id: `l2-${idx}`,
        label: `L2 #${idx}`,
      })),
    };

    const { totals } = computeSimulation(state);
    expect(totals.avgBytesPerBlock / 1024).toBeCloseTo(3.47, 2);
    expect(totals.peakSharePct).toBeCloseTo(48.8, 1);
    expect(totals.lane?.blocksToClear).toBe(5);
    expect(totals.dailyBlocks).toBeCloseTo(2, 1);
  });
});
