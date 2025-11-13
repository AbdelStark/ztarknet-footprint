interface ShareControlsProps {
  onShare: () => Promise<void>;
  onExportPng: () => Promise<void>;
  onExportPdf: () => Promise<void>;
}

export function ShareControls({
  onShare,
  onExportPdf,
  onExportPng,
}: ShareControlsProps) {
  return (
    <div className="share-bar">
      <button type="button" className="btn btn-accent" onClick={onShare}>
        Share link
      </button>
      <button type="button" className="btn" onClick={onExportPng}>
        Export PNG
      </button>
      <button type="button" className="btn" onClick={onExportPdf}>
        Export PDF
      </button>
    </div>
  );
}
