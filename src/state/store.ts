import { create } from 'zustand';
import type { GlobalSettings, L2Spec, SimulationState, UnitsMode } from '../types';

export type PresetKey = 'base' | 'conservative' | 'aggressive' | 'twenty';

export interface PresetDefinition {
  key: PresetKey;
  label: string;
  description: string;
  buildState: () => SimulationState;
}

export interface SimulationStore extends SimulationState {
  presetKey: PresetKey | null;
  setUnits: (units: UnitsMode) => void;
  setGlobal: (values: Partial<GlobalSettings>) => void;
  updateL2: (id: string, values: Partial<L2Spec>) => void;
  addL2: (template?: Partial<L2Spec>) => void;
  removeL2: (id: string) => void;
  applyPreset: (key: PresetKey) => void;
  replaceState: (state: SimulationState) => void;
}

const STATE_PARAM = 's';

const globalCrypto =
  typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;

const DEFAULT_GLOBAL: GlobalSettings = {
  blockSizeBytes: 2 * 1024 * 1024,
  blockTimeSeconds: 75,
  lanePct: 10,
  units: 'binary',
};

const DEFAULT_L2: L2Spec = makeL2({
  label: 'Payments L2',
  tps: 10_000,
  settlementCadenceSeconds: 6 * 3_600,
  proofSizeBytes: 50 * 1024,
});

const DEFAULT_STATE: SimulationState = {
  global: DEFAULT_GLOBAL,
  l2s: [DEFAULT_L2],
};

const PRESETS: PresetDefinition[] = [
  {
    key: 'base',
    label: 'Base',
    description: 'Single high-throughput L2 @ 6h cadence',
    buildState: () => ({
      global: { ...DEFAULT_GLOBAL },
      l2s: [makeL2(DEFAULT_L2)],
    }),
  },
  {
    key: 'conservative',
    label: 'Conservative',
    description: 'Slow cadence, heavier proofs, 3 L2s',
    buildState: () => ({
      global: { ...DEFAULT_GLOBAL, lanePct: 5 },
      l2s: [
        makeL2({
          label: 'Payments',
          tps: 5_000,
          settlementCadenceSeconds: 12 * 3_600,
          proofSizeBytes: 80 * 1024,
        }),
        makeL2({
          label: 'DeFi',
          tps: 3_000,
          settlementCadenceSeconds: 8 * 3_600,
          proofSizeBytes: 70 * 1024,
        }),
        makeL2({
          label: 'Gaming',
          tps: 8_000,
          settlementCadenceSeconds: 4 * 3_600,
          proofSizeBytes: 60 * 1024,
        }),
      ],
    }),
  },
  {
    key: 'aggressive',
    label: 'Aggressive',
    description: 'Faster cadence, 4 rollups, 15% lane',
    buildState: () => ({
      global: { ...DEFAULT_GLOBAL, lanePct: 15 },
      l2s: [
        makeL2({
          label: 'Payments',
          tps: 20_000,
          settlementCadenceSeconds: 3 * 3_600,
          proofSizeBytes: 64 * 1024,
        }),
        makeL2({
          label: 'Defi',
          tps: 12_000,
          settlementCadenceSeconds: 2 * 3_600,
          proofSizeBytes: 70 * 1024,
        }),
        makeL2({
          label: 'Social',
          tps: 15_000,
          settlementCadenceSeconds: 4 * 3_600,
          proofSizeBytes: 55 * 1024,
        }),
        makeL2({
          label: 'Gaming',
          tps: 25_000,
          settlementCadenceSeconds: 2 * 3_600,
          proofSizeBytes: 80 * 1024,
        }),
      ],
    }),
  },
  {
    key: 'twenty',
    label: 'Twenty L2s',
    description: 'Stress test with twenty identical rollups',
    buildState: () => ({
      global: { ...DEFAULT_GLOBAL, lanePct: 10 },
      l2s: Array.from({ length: 20 }, (_, idx) =>
        makeL2({
          label: `L2 #${idx + 1}`,
          tps: 10_000,
          settlementCadenceSeconds: 6 * 3_600,
          proofSizeBytes: 50 * 1024,
        }),
      ),
    }),
  },
];

const PRESET_MAP: Record<PresetKey, PresetDefinition> = PRESETS.reduce(
  (acc, preset) => {
    acc[preset.key] = preset;
    return acc;
  },
  {} as Record<PresetKey, PresetDefinition>,
);

function makeInitialState(): SimulationState {
  const fromUrl = loadStateFromUrl();
  if (fromUrl) {
    return fromUrl;
  }
  return DEFAULT_STATE;
}

export const useSimulationStore = create<SimulationStore>((set) => {
  const initial = cloneState(makeInitialState());
  return {
    ...initial,
    presetKey: null,
    setUnits: (units) =>
      set((state) => ({ global: { ...state.global, units }, presetKey: null })),
    setGlobal: (values) =>
      set((state) => ({
        global: { ...state.global, ...values },
        presetKey: null,
      })),
    updateL2: (id, values) =>
      set((state) => ({
        l2s: state.l2s.map((l2) =>
          l2.id === id ? { ...l2, ...values } : l2,
        ),
        presetKey: null,
      })),
    addL2: (template) =>
      set((state) => ({
        l2s: [...state.l2s, makeL2(template)],
        presetKey: null,
      })),
    removeL2: (id) =>
      set((state) => {
        if (state.l2s.length === 1) {
          return state;
        }
        return {
          l2s: state.l2s.filter((l2) => l2.id !== id),
          presetKey: null,
        };
      }),
    applyPreset: (key) => {
      const preset = PRESET_MAP[key];
      if (!preset) return;
      set({ ...cloneState(preset.buildState()), presetKey: key });
    },
    replaceState: (fresh) =>
      set(() => ({
        ...sanitizeState(fresh),
        presetKey: null,
      })),
  };
});

export function getPresets(): PresetDefinition[] {
  return PRESETS;
}

function makeL2(template?: Partial<L2Spec>): L2Spec {
  return {
    id: cryptoId(),
    label: template?.label ?? 'New L2',
    tps: template?.tps ?? 5_000,
    settlementCadenceSeconds: template?.settlementCadenceSeconds ?? 6 * 3_600,
    proofSizeBytes: template?.proofSizeBytes ?? 50 * 1024,
  };
}

function cryptoId(): string {
  if (globalCrypto?.randomUUID) {
    return globalCrypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

function cloneState(state: SimulationState): SimulationState {
  const l2s = state.l2s?.length ? state.l2s : [makeL2()];
  return {
    global: { ...state.global },
    l2s: l2s.map((l2) => ({ ...l2, id: l2.id ?? cryptoId() })),
  };
}

function loadStateFromUrl(): SimulationState | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const params = new URLSearchParams(window.location.search);
  const payload = params.get(STATE_PARAM);
  if (!payload) {
    return null;
  }
  try {
    const json = decodePayload(payload);
    const parsed = JSON.parse(json) as SimulationState;
    return sanitizeState(parsed);
  } catch {
    return null;
  }
}

function sanitizeState(state: SimulationState): SimulationState {
  const units: UnitsMode =
    state.global.units === 'decimal' ? 'decimal' : 'binary';
  const laneRaw = state.global.lanePct;
  return {
    global: {
      blockSizeBytes: state.global.blockSizeBytes || DEFAULT_GLOBAL.blockSizeBytes,
      blockTimeSeconds:
        state.global.blockTimeSeconds || DEFAULT_GLOBAL.blockTimeSeconds,
      lanePct:
        typeof laneRaw === 'number' && laneRaw >= 0 ? laneRaw : DEFAULT_GLOBAL.lanePct,
      units,
    },
    l2s:
      state.l2s?.map((l2, idx) => ({
        id: l2.id ?? cryptoId(),
        label: l2.label || `L2 #${idx + 1}`,
        tps: Math.max(1, Math.round(l2.tps)),
        settlementCadenceSeconds: Math.max(
          60,
          Math.round(l2.settlementCadenceSeconds),
        ),
        proofSizeBytes: Math.max(1024, Math.round(l2.proofSizeBytes)),
      })) ?? [makeL2()],
  };
}

function encodeState(state: SimulationState): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const json = JSON.stringify(state);
  const encoder = new TextEncoder();
  const bytes = encoder.encode(json);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  binary = window.btoa(binary);
  return binary.replace(/=+$/, '');
}

function decodePayload(payload: string): string {
  const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
  const binary = window.atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

function currentStateSnapshot(): SimulationState {
  const { global, l2s } = useSimulationStore.getState();
  return {
    global: { ...global },
    l2s: l2s.map((l2) => ({ ...l2 })),
  };
}

function syncStateToUrl() {
  if (typeof window === 'undefined') {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const serialized = encodeState(currentStateSnapshot());
  if (!serialized) {
    return;
  }
  params.set(STATE_PARAM, serialized);
  const next = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
  window.history.replaceState({}, '', next);
}

if (typeof window !== 'undefined') {
  useSimulationStore.subscribe(() => {
    syncStateToUrl();
  });
}
