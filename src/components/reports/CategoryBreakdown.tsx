import { formatKES } from "@/lib/utils";

type Row = { category: string; revenue: number };

export function CategoryBreakdown({ data }: { data: Row[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-text-secondary">No sales for this period.</p>;
  }

  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="flex flex-col gap-3">
      {data.map((row) => (
        <div key={row.category} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-sm text-text-primary">
            {row.category}
          </span>
          <div className="h-1.5 flex-1 rounded-full bg-surface-hover">
            <div
              className="h-1.5 rounded-full bg-accent"
              style={{ width: `${(row.revenue / max) * 100}%` }}
            />
          </div>
          <span className="font-numeric w-20 shrink-0 text-right text-xs text-text-secondary">
            {formatKES(row.revenue)}
          </span>
        </div>
      ))}
    </div>
  );
}
