interface Metric {
  label: string;
  value: string;
  caption?: string;
}

interface KpiGridProps {
  metrics: Metric[];
}

export function KpiGrid({ metrics }: KpiGridProps) {
  return (
    <div className="kpi-grid">
      {metrics.map((metric) => (
        <div className="kpi" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          {metric.caption ? <small>{metric.caption}</small> : null}
        </div>
      ))}
    </div>
  );
}
