import { useEffect, useMemo, useRef, useState } from 'react';
import { computeSimulation } from './calc/model';
import { buildMarkdownSnippet } from './calc/snippet';
import { copyText } from './utils/clipboard';
import { exportNodeAsPdf, exportNodeAsPng } from './utils/exporters';
import { useSimulationStore, getPresets } from './state/store';
import { InputsPanel } from './components/InputsPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { ShareControls } from './components/ShareControls';
import { PresetsBar } from './components/PresetsBar';

function App() {
  const global = useSimulationStore((state) => state.global);
  const l2s = useSimulationStore((state) => state.l2s);
  const presetKey = useSimulationStore((state) => state.presetKey);
  const setGlobal = useSimulationStore((state) => state.setGlobal);
  const setUnits = useSimulationStore((state) => state.setUnits);
  const updateL2 = useSimulationStore((state) => state.updateL2);
  const addL2 = useSimulationStore((state) => state.addL2);
  const removeL2 = useSimulationStore((state) => state.removeL2);
  const applyPreset = useSimulationStore((state) => state.applyPreset);

  const stateShape = useMemo(() => ({ global, l2s }), [global, l2s]);
  const results = useMemo(
    () => computeSimulation(stateShape),
    [stateShape],
  );

  const markdown = useMemo(
    () => buildMarkdownSnippet(stateShape, results),
    [stateShape, results],
  );

  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const resultsRef = useRef<HTMLDivElement>(null);

  const run = async (
    fn: () => Promise<void | boolean>,
    successMessage: string,
    failureMessage = 'Action failed',
  ) => {
    try {
      const outcome = await fn();
      if (outcome === false) {
        setToast(failureMessage);
        return;
      }
      setToast(successMessage);
    } catch (error) {
      console.error(error);
      setToast(failureMessage);
    }
  };

  const handleShare = () =>
    run(
      async () => {
        if (typeof window === 'undefined') return false;
        return copyText(window.location.href);
      },
      'Link copied',
    );

  const handleCopyMarkdown = () =>
    run(() => copyText(markdown), 'Markdown copied');

  const handleExportPng = () =>
    run(
      () => exportNodeAsPng(resultsRef.current),
      'PNG on its way',
    );

  const handleExportPdf = () =>
    run(
      () => exportNodeAsPdf(resultsRef.current),
      'PDF exported',
    );

  const presets = getPresets();

  return (
    <div className="app-shell">
      <section className="surface">
        <div className="hero">
          <div>
            <h1>Ztarknet Footprint</h1>
            <p>
              Byte-accurate simulator for Starknet-style L2 settlements on
              Zcash L1. Dial TPS, cadence, and proof sizes to see how tiny the
              blockspace footprint remains—even with dozens of rollups.
            </p>
          </div>
          <ShareControls
            onShare={handleShare}
            onExportPdf={handleExportPdf}
            onExportPng={handleExportPng}
          />
        </div>
        <div className="panel-title" style={{ marginTop: 20 }}>
          Presets
        </div>
        <PresetsBar
          presets={presets}
          activeKey={presetKey}
          onSelect={(key) => applyPreset(key)}
        />
        <p style={{ marginTop: 12, color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
          {presetKey
            ? presets.find((preset) => preset.key === presetKey)?.description
            : 'Custom scenario'}
        </p>
      </section>

      <div className="layout">
        <InputsPanel
          global={global}
          l2s={l2s}
          setGlobal={setGlobal}
          setUnits={setUnits}
          updateL2={updateL2}
          addL2={addL2}
          removeL2={removeL2}
        />
        <section className="surface" ref={resultsRef}>
          <ResultsPanel
            global={global}
            results={results}
            markdown={markdown}
            onCopyMarkdown={handleCopyMarkdown}
          />
        </section>
      </div>

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

export default App;
