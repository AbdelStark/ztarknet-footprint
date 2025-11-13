Below is a complete **PRD + implementation plan** for the **Ztarknet Footprint Calculator**—a cypherpunk‑themed, retro‑vintage yet clean web app that lets anyone simulate L1 blockspace impact from STARK‑verified L2 settlements.

---

# PRD — Ztarknet Footprint Calculator

## 1) One‑liner

A browser‑only simulator that shows how much **Zcash L1 blockspace** Starknet‑style L2 settlements consume under different assumptions (TPS, settlement cadence, proof size, number of L2s, etc.), with **byte‑accurate math** and **shareable URLs**.

## 2) Who it’s for

* **Zcash core engineers** (sanity‑check resource envelopes, policy lanes).
* **Researchers / governance** (reason about adoption trade‑offs).
* **Builders/partners** (estimate operating points for an L2).
* **Community** (intuitive visuals; no jargon required).

## 3) Goals (what success looks like)

* Run **deterministic simulations** entirely in the browser (no backend).
* Communicate **how small** the L1 footprint is in average and peak terms.
* Make “what‑if” changes trivial: sliders + numeric inputs; instant visuals.
* Produce **forum‑ready snippets** and **exportable images/PDF** of the charts.
* **Shareable**: every simulation state encodes into the URL.

## 4) Non‑goals

* No real‑time blockchain data, no wallet, no private info.
* No proof system selection benchmark; this is footprint only (bytes/percent).
* No tokenomics/fee modeling beyond byte‑level mempool policy.

## 5) Core concepts & defaults

* **Block size** (bytes): default **2 MiB** (2,048 KiB).
* **Block time** (seconds): default **75 s** (≈ 288 blocks/6 h, 1152/day).
* **L2 TPS**: default **10,000**.
* **Settlement cadence**: default **6 h**.
* **Proof size**: default **50 KiB** (51,200 bytes).
* **Number of L2s**: default **1**, supports **20+**.
* **Policy lane** (optional): e.g., **≤ 10% of bytes per block** for `STARK_VERIFY`.

> All constants and results are **binary units** by default (KiB/MiB). Toggle to **decimal** (KB/MB) if desired.

## 6) User stories

* *As a core engineer*, I can set TPS=10k, proof=50 KiB, cadence=6 h, L2s=20 and see:

  * per‑settlement bytes, **per‑block peak** (if proofs align), **average per block**, **daily share**.
  * how a **10% policy lane** schedules proofs over a few blocks.
* *As a community member*, I can export a **PNG/PDF** and paste a **Markdown snippet** with the exact numbers.
* *As a researcher*, I can toggle binary/decimal units, adjust block size/time, and add **custom L2 groups** with heterogeneous parameters.

## 7) Functional requirements

### Inputs

* Global:

  * Block size (bytes or KiB/MiB)
  * Block time (seconds)
  * Policy lane (off / % of block)
  * Units toggle (binary/decimal)
* L2 set (one or many):

  * TPS (integer)
  * Settlement cadence (minutes/hours)
  * Proof size (bytes/KiB/MB)
  * Label (e.g., “Payments L2”)
* Presets: **Base**, **Conservative**, **Aggressive**, **Twenty L2s**.

### Outputs (computed)

Per L2 and Aggregated:

* **Tx/settlement**, **proof bytes/settlement**.
* **Avg bytes/block** over the settlement window and over a day.
* **Share of a block** (avg %).
* **Peak bytes/block** if all proofs land together (worst‑case).
* **Blocks to clear** under policy lane; **elapsed time** in blocks (not wall‑clock).
* **Daily blocks consumed** (equivalent 2 MiB blocks).
* **L1 bytes per L2 tx** and **L2 tx per L1 byte**.

### Visualizations

* **Block bar** (2 MiB): stacked segment showing **proof share** vs **free space** (single proof, many proofs).
* **Average bar**: tiny bar indicating average bytes/block (expect “barely visible” to emphasize smallness).
* **Lane scheduler**: simple strip showing how many blocks needed to clear N proofs at lane %.
* **6‑hour/day gauges**: “supply vs demand” bars (expect demand ≪ supply).
* **Markdown snippet** generator reflecting current inputs.

### Export & share

* Copy link (URL‑encoded state).
* Export **PNG** of charts, and **PDF** one‑pager.
* Copy **Markdown** snippet (tables + small ASCII visuals).

### Accessibility & UX

* Keyboard‑navigable inputs; visible focus rings.
* High‑contrast dark theme; WCAG AA text contrast.
* Tooltips with formulas and definitions.

## 8) Theming — “Cypherpunk Retro, Clean”

* Typography: **IBM Plex Mono** (primary), **Plex Sans** (secondary).
* Palette (tokens, examples):

  * `--bg: #0B0E0C; --panel: #121514;`
  * `--ink: #E6F5EC; --muted: #A5B9AE;`
  * `--accent: #00FF88; --accent-2: #FFD166;`
* Motifs: faint **scanline** overlay (very low opacity), subtle **phosphor glow** on headings, monospace numerals, **ASCII frame** accents.
* Motion: minimal (reduce‑motion aware), tiny flicker on headings only.
* Clean layout: generous spacing, grid‑aligned panels, avoid clutter.

## 9) Information architecture

* **Header**: title, presets, share/export.
* **Inputs panel** (left): global settings, L2 list (add/remove), each L2 collapsible.
* **Results panel** (right): KPIs, charts (block bar, averages, lane scheduler), text tables.
* **Details** drawer: formulas, units, assumptions.

## 10) Calculation spec (canonical formulas)

Let:

* `B` = block size bytes
* `T` = block time seconds
* `L` = number of L2s
* For each L2 `i`:

  * `tps_i` = TPS
  * `cadence_i` = settlement interval seconds
  * `proof_i` = proof size bytes

Derived:

* Blocks/second = `1/T`; Blocks/day = `86400/T`
* Blocks in cadence_i = `cadence_i / T`
* L2 tx per settlement_i = `tps_i * cadence_i`
* Avg bytes/block_i (over cadence) = `proof_i / (cadence_i / T)`
* Peak share (single block) for a set S of proofs: `sum(proof_i for i in S) / B`
* Lane capacity per block (bytes) = `lane_pct * B`
* Proofs per block (lane) = `floor(lane_capacity / proof_i)` (heterogeneous ⇒ greedy pack by size)
* Blocks to clear N proofs (homogeneous) = `ceil( N / proofs_per_block )`
* L1 bytes per L2 tx_i = `proof_i / (tps_i * cadence_i)`
* L2 tx per L1 byte_i = `(tps_i * cadence_i) / proof_i`
* Daily blocks consumed (equivalent) for set S: `sum(proof_i * (86400/cadence_i)) / B`

**Units handling:** support binary (KiB/MiB) and decimal (KB/MB). Show both in tooltips.

## 11) Validation

* Bounds: TPS ∈ [1, 10^7], cadence ∈ [60 s, 7 days], proof ∈ [1 KiB, 10 MiB], L2 count ≤ 200 (UI capped).
* Error messages: crisp, monospace, inline.
* Determinism: pure functions; snapshot tests of all formulas.

## 12) Telemetry (optional & privacy‑respecting)

* Toggle “Allow anonymous usage stats”.
* If enabled: record only **button clicks** (preset chosen, export used) and **parameter histograms** (bucketed), no IP, no PII.

---

# Implementation Plan

## A) Tech stack

* **Framework**: Next.js (static export) or Vite + React; all client‑side.
* **Language**: TypeScript.
* **State**: Zustand or React Context + Reducer (URL‑synced).
* **Charts**: Lightweight SVG components (hand‑rolled) for full theme control; no heavy chart libs.
* **Styling**: CSS modules or Tailwind with a small design‑token layer.
* **Build/Deploy**: GitHub Pages or Cloudflare Pages (static).
* **Tests**: Vitest (unit), Playwright (e2e), axe‑core (a11y).

## B) Data model (TypeScript)

```ts
type Units = "binary" | "decimal";

type GlobalConfig = {
  blockSizeBytes: number;   // default 2 * 1024 * 1024
  blockTimeSeconds: number; // default 75
  lanePct?: number;         // e.g., 0.10 for 10%, undefined = off
  units: Units;             // "binary" default
};

type L2Input = {
  id: string;
  label: string;            // e.g., "Payments L2"
  tps: number;              // >= 1
  cadenceSeconds: number;   // >= 60
  proofBytes: number;       // >= 1024
};

type SimulationState = {
  global: GlobalConfig;
  l2s: L2Input[];
};
```

## C) Pure calculation module (TypeScript)

```ts
export function blocksPer(intervalSeconds: number, blockTimeSeconds: number) {
  return intervalSeconds / blockTimeSeconds;
}

export function txPerSettlement(tps: number, cadenceSeconds: number) {
  return tps * cadenceSeconds;
}

export function avgBytesPerBlock(proofBytes: number, cadenceSeconds: number, blockTimeSeconds: number) {
  return proofBytes / blocksPer(cadenceSeconds, blockTimeSeconds);
}

export function peakShareSumBytes(sumProofBytes: number, blockSizeBytes: number) {
  return sumProofBytes / blockSizeBytes; // 0..1
}

export function laneCapacityBytes(blockSizeBytes: number, lanePct?: number) {
  return lanePct ? Math.floor(lanePct * blockSizeBytes) : blockSizeBytes;
}

// Homogeneous case (same proof size)
export function blocksToClearHomogeneous(nProofs: number, proofBytes: number, blockSizeBytes: number, lanePct?: number) {
  const cap = laneCapacityBytes(blockSizeBytes, lanePct);
  const perBlock = Math.max(1, Math.floor(cap / proofBytes));
  return Math.ceil(nProofs / perBlock);
}

export function bytesPerTx(proofBytes: number, tps: number, cadenceSeconds: number) {
  const txs = txPerSettlement(tps, cadenceSeconds);
  return proofBytes / txs;
}

export function dailyBlocksConsumed(l2s: L2Input[], blockSizeBytes: number) {
  const secondsPerDay = 86400;
  const totalBytes = l2s.reduce((acc, l2) => acc + l2.proofBytes * (secondsPerDay / l2.cadenceSeconds), 0);
  return totalBytes / blockSizeBytes;
}
```

## D) UI architecture

* `App`
  ├─ `Header` (title, theme toggle, presets, share/export)
  ├─ `InputsPanel`
  │   ├─ `GlobalInputs` (block size/time, units, lane)
  │   └─ `L2List` (add/remove/duplicate L2)
  └─ `ResultsPanel`
  ├─ `Kpis` (cards: avg bytes/block, daily blocks, bytes/tx, tx/byte)
  ├─ `BlockBar` (single‑block composition)
  ├─ `AverageBars` (per‑block averages)
  ├─ `LaneScheduler` (blocks to clear under lane)
  └─ `MarkdownExporter`

## E) URL state & presets

* Serialize `SimulationState` into a compact base64url or query params.
* Presets are just predefined states; loading a preset updates the URL.

## F) Styling tokens (example CSS)

```css
:root {
  --bg: #0B0E0C; --panel: #121514;
  --ink: #E6F5EC; --muted: #A5B9AE;
  --accent: #00FF88; --accent2: #FFD166;
  --radius: 10px; --grid: 8px;
  --mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
}
body { background: var(--bg); color: var(--ink); font-family: var(--mono); }
.panel { background: var(--panel); border-radius: var(--radius); padding: calc(2*var(--grid)); }
.halo { text-shadow: 0 0 8px color-mix(in oklab, var(--accent), transparent 80%); }
.scanline::after { content: ""; position: fixed; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(transparent 0 2px, rgba(255,255,255,.02) 2px 3px); }
```

## G) ASCII wireframe

```
┌──────────────────────── Ztarknet Footprint Calculator ────────────────────────┐
│ [Preset ▼]  [Share Link]  [Export PNG] [Export PDF]           (dark, mono)   │
├─────────────────────────┬─────────────────────────────────────────────────────┤
│  Global Settings        │  KPIs                                              │
│  ─ Block size: 2 MiB    │  • Avg bytes/block (agg): 3.47 KiB                 │
│  ─ Block time: 75 s     │  • Daily blocks consumed: 2.00                     │
│  ─ Lane: 10% (opt)      │  • L1 bytes/L2 tx: 0.000237                        │
│  ─ Units: [KiB/MiB]     │  • L2 tx/L1 byte: 4219                             │
│                         ├─────────────────────────────────────────────────────┤
│  L2s                    │  [BlockBar: one-block composition]                 │
│  [ + Add L2 ]           │  [AverageBars: tiny averages per block]            │
│  ┌ L2 #1 ────────────┐  ├─────────────────────────────────────────────────────┤
│  │ TPS: 10,000       │  │  Lane Scheduler: blocks to clear N proofs          │
│  │ Cadence: 6 h      │  └─────────────────────────────────────────────────────┘
│  │ Proof: 50 KiB     │   Markdown Snippet [Copy]                              │
│  └───────────────────┘                                                         │
└───────────────────────────────────────────────────────────────────────────────┘
```

## H) Acceptance criteria (examples)

* With defaults (10k TPS, 6 h, 50 KiB, 2 MiB, 75 s):

  * Avg bytes/block (1 L2) ≈ **0.174 KiB**; (20 L2s) ≈ **3.47 KiB**.
  * Peak share (20 proofs in one block) ≈ **48.8%**.
  * Blocks to clear under 10% lane (20 proofs): **5**.
  * Daily blocks (20 L2s) ≈ **2**.
* URL round‑trip reproduces the same numbers.
* Exported PNG/PDF matches current view and embeds parameters.

## I) QA & testing

* **Unit**: formula module golden tests (binary/decimal, extreme values).
* **E2E**: user flows (add/remove L2s, presets, export).
* **Accessibility**: keyboard tab order, roles, labels, axe checks.
* **Visual regression**: screenshot compare for charts/panels.

## J) Risks & mitigations

* **Numerical drift**: fix to integers internally (bytes/seconds), format at presentation.
* **Too‑small visuals**: show explicit “too small to render” labels for tiny averages.
* **Confusion over units**: prominent units toggle with hover definitions.

---

# Developer Quick‑start (skeleton)

```bash
# Create app
pnpm create vite@latest ztarknet-footprint --template react-ts
cd ztarknet-footprint && pnpm i

# Add dependencies
pnpm add zustand zod classnames
pnpm add -D vitest @testing-library/react @testing-library/jest-dom playwright axe-core
```

**Core file stubs**

```
src/
  calc/
    model.ts           # pure functions (above)
    units.ts           # binary/decimal helpers
  state/
    store.ts           # Zustand store + URL sync
  components/
    InputsPanel.tsx
    GlobalInputs.tsx
    L2Card.tsx
    ResultsPanel.tsx
    Kpis.tsx
    BlockBar.tsx
    AverageBars.tsx
    LaneScheduler.tsx
    MarkdownExporter.tsx
  styles/
    tokens.css
    app.css
```

**Block bar (SVG) sketch**

```tsx
export function BlockBar({ sumProofBytes, blockSizeBytes }: { sumProofBytes: number; blockSizeBytes: number }) {
  const w = 600, h = 28, used = Math.min(w, Math.round((sumProofBytes / blockSizeBytes) * w));
  return (
    <svg width={w} height={h} role="img" aria-label="Single 2 MiB block composition">
      <rect x="0" y="0" width={w} height={h} rx="6" className="bar-bg" />
      <rect x="0" y="0" width={used} height={h} rx="6" className="bar-used" />
      <text x={w-4} y={h-8} textAnchor="end" className="bar-label">
        {(100 * sumProofBytes / blockSizeBytes).toFixed(2)}%
      </text>
    </svg>
  );
}
```

**Markdown exporter (snippet)**

```ts
export function makeSnippet(state: SimulationState, results: any) {
  const { global, l2s } = state;
  const header = `# Footprint (block=${fmtB(global.blockSizeBytes)}, time=${global.blockTimeSeconds}s, lane=${fmtPct(global.lanePct)})`;
  const table = makeMarkdownTable(l2s, results);
  return `${header}\n\n${results.summary}\n\n${table}\n`;
}
```

