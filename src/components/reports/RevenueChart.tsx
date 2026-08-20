"use client";

import { useState } from "react";
import { formatKES } from "@/lib/utils";

type Point = { date: string; revenue: number };

const CHART_HEIGHT = 200;
const PADDING_BOTTOM = 24;

function shortDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-KE", { day: "2-digit", month: "short" });
}

export function RevenueChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-text-secondary">
        No revenue data for this period.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const plotHeight = CHART_HEIGHT - PADDING_BOTTOM;
  const barGap = 4;
  const barWidth = 100 / data.length;
  const labelStep = Math.max(1, Math.ceil(data.length / 7));

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 100 ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        className="h-[200px] w-full overflow-visible"
      >
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={0}
            x2={100}
            y1={plotHeight * (1 - f)}
            y2={plotHeight * (1 - f)}
            stroke="var(--border)"
            strokeWidth={0.3}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {data.map((d, i) => {
          const h = (d.revenue / max) * plotHeight;
          const x = i * barWidth + barGap / 2;
          const w = Math.max(barWidth - barGap, 1);
          return (
            <rect
              key={d.date}
              x={x}
              y={plotHeight - h}
              width={w}
              height={Math.max(h, 1)}
              rx={1.5}
              fill={hover === i ? "var(--accent-hover)" : "var(--accent)"}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="cursor-pointer transition-colors duration-150"
            />
          );
        })}

        <line
          x1={0}
          x2={100}
          y1={plotHeight}
          y2={plotHeight}
          stroke="var(--border)"
          strokeWidth={0.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="mt-1 flex text-[10px] text-text-secondary">
        {data.map((d, i) => (
          <div key={d.date} style={{ width: `${barWidth}%` }} className="text-center">
            {i % labelStep === 0 ? shortDate(d.date) : ""}
          </div>
        ))}
      </div>

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs shadow-sm"
          style={{ left: `${hover * barWidth + barWidth / 2}%` }}
        >
          <p className="text-text-secondary">{shortDate(data[hover].date)}</p>
          <p className="font-numeric text-accent">{formatKES(data[hover].revenue)}</p>
        </div>
      )}
    </div>
  );
}
