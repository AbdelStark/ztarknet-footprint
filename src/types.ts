export type UnitsMode = 'binary' | 'decimal';

export interface GlobalSettings {
  blockSizeBytes: number;
  blockTimeSeconds: number;
  lanePct: number | null; // percentage of block reserved for proofs
  units: UnitsMode;
}

export interface L2Spec {
  id: string;
  label: string;
  tps: number;
  settlementCadenceSeconds: number;
  proofSizeBytes: number;
}

export interface SimulationState {
  global: GlobalSettings;
  l2s: L2Spec[];
}
