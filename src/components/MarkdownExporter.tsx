interface MarkdownExporterProps {
  snippet: string;
  onCopy: () => Promise<void>;
}

export function MarkdownExporter({
  snippet,
  onCopy,
}: MarkdownExporterProps) {
  return (
    <div>
      <div className="panel-title">Markdown snippet</div>
      <div className="markdown-box">
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{snippet}</pre>
      </div>
      <button type="button" className="btn btn-ghost" onClick={onCopy}>
        Copy Markdown
      </button>
    </div>
  );
}
