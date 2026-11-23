interface DonutSegment {
  color: string;
  value: number;
}

export function Donut({ segments }: { segments: DonutSegment[] }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const radius = 72;
  const stroke = 16;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg viewBox="0 0 180 180" className="h-[180px] w-[180px]">
      <circle cx="90" cy="90" r={radius} fill="none" stroke="#26262A" strokeWidth={stroke} />
      {total > 0
        ? segments.map((segment, index) => {
            const length = (segment.value / total) * circumference;
            const circle = (
              <circle
                key={index}
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={stroke}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                transform="rotate(-90 90 90)"
              />
            );
            offset += length;
            return circle;
          })
        : null}
    </svg>
  );
}

export function MiniBars({
  values,
  color = '#A9C6F5',
}: {
  values: number[];
  color?: string;
}) {
  const max = Math.max(1, ...values.map((value) => Math.abs(value)));
  return (
    <div className="flex h-[58px] items-end gap-1.5">
      {values.map((value, index) => (
        <div
          key={index}
          className="w-2 rounded-full"
          style={{
            height: `${Math.max(12, (Math.abs(value) / max) * 100)}%`,
            backgroundColor: color,
            opacity: 0.35 + (index / Math.max(1, values.length - 1)) * 0.65,
          }}
        />
      ))}
    </div>
  );
}

export interface CashflowPoint {
  label: string;
  income: number;
  expense: number;
  debt: number;
}

export function CashflowChart({ data }: { data: CashflowPoint[] }) {
  const max = Math.max(
    1,
    ...data.flatMap((point) => [point.income, point.expense, point.debt]),
  );
  const series = [
    { key: 'income', color: 'bg-skybar' },
    { key: 'expense', color: 'bg-[#5A5A63]' },
    { key: 'debt', color: 'bg-neon' },
  ] as const;

  return (
    <div className="flex items-end justify-between gap-6 px-2">
      {data.map((point) => (
        <div key={point.label} className="flex flex-1 flex-col items-center gap-3">
          <div className="flex h-[190px] items-end gap-1.5">
            {series.map((entry) => (
              <div
                key={entry.key}
                className={`w-3 rounded-full ${entry.color}`}
                style={{ height: `${Math.max(4, (point[entry.key] / max) * 100)}%` }}
              />
            ))}
          </div>
          <span className="text-[13px] text-muted">{point.label}</span>
        </div>
      ))}
    </div>
  );
}
