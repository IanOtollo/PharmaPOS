"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import {
  Wallet,
  Receipt,
  Package,
  TrendingUp,
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { StatCard } from "@/components/dashboard/StatCard";
import { LiveClock } from "@/components/dashboard/LiveClock";
import { RevenueChart } from "@/components/reports/RevenueChart";
import { cn, formatKES } from "@/lib/utils";

const TREND_RANGES = [
  { label: "Today", value: 1 },
  { label: "This Week", value: 7 },
  { label: "This Month", value: 30 },
] as const;

export default function DashboardPage() {
  const summary = useQuery(api.dashboard.summary);
  const [trendRange, setTrendRange] = useState<number>(7);
  const trend = useQuery(api.reports.summary, { rangeDays: trendRange });

  if (summary === undefined) {
    return (
      <div className="px-4 py-16 text-center text-sm text-text-secondary sm:px-6">
        Loading…
      </div>
    );
  }

  const maxTopQty = Math.max(1, ...summary.topProducts.map((p) => p.quantity));
  const totalPayments = Object.values(summary.paymentBreakdown).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary">
          Dashboard
        </h1>
        <LiveClock />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Today's Revenue" value={formatKES(summary.revenue)} icon={Wallet} />
        <StatCard label="Today's Sales" value={String(summary.salesCount)} icon={Receipt} />
        <StatCard label="Items Sold" value={String(summary.itemsSold)} icon={Package} />
        <StatCard
          label="Avg Sale Value"
          value={formatKES(summary.avgSale)}
          icon={TrendingUp}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-lg border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-display text-base font-bold text-text-primary">
                Revenue trend
              </p>
              <Link
                href="/reports"
                className="flex items-center gap-1 text-sm text-accent transition-colors duration-150 hover:text-accent-hover"
              >
                Full reports <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="mt-3 flex gap-2">
              {TREND_RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setTrendRange(r.value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors duration-150",
                    trendRange === r.value
                      ? "bg-accent text-background"
                      : "border border-border text-text-secondary hover:bg-surface-hover"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="mt-4">
              {trend === undefined ? (
                <p className="py-16 text-center text-sm text-text-secondary">Loading…</p>
              ) : (
                <RevenueChart data={trend.daily} />
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-6">
            <p className="mb-4 font-display text-base font-bold text-text-primary">
              Top selling today
            </p>
            {summary.topProducts.length === 0 ? (
              <p className="text-sm text-text-secondary">No sales yet today.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {summary.topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="w-4 shrink-0 text-xs text-text-secondary">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-text-primary">{p.name}</p>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-surface-hover">
                        <div
                          className="h-1.5 rounded-full bg-accent"
                          style={{ width: `${(p.quantity / maxTopQty) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-numeric shrink-0 text-sm text-text-secondary">
                      {p.quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-surface p-6">
            <p className="mb-4 font-display text-base font-bold text-text-primary">
              Payment methods today
            </p>
            {totalPayments === 0 ? (
              <p className="text-sm text-text-secondary">No sales yet today.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {Object.entries(summary.paymentBreakdown).map(([method, count]) => (
                  <div key={method} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-sm capitalize text-text-primary">
                      {method === "mpesa" ? "M-Pesa" : method}
                    </span>
                    <div className="h-1.5 flex-1 rounded-full bg-surface-hover">
                      <div
                        className="h-1.5 rounded-full bg-accent"
                        style={{ width: `${(count / totalPayments) * 100}%` }}
                      />
                    </div>
                    <span className="font-numeric w-6 shrink-0 text-right text-sm text-text-secondary">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-surface p-2">
            <Link
              href="/inventory?filter=Low+Stock"
              className="flex items-center gap-3 rounded-md p-4 transition-colors duration-150 hover:bg-surface-hover"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-warning/10">
                <AlertTriangle size={16} className="text-warning" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary">Low stock alerts</p>
                <p className="font-numeric text-xs text-text-secondary">
                  {summary.lowStockCount} product{summary.lowStockCount === 1 ? "" : "s"}
                </p>
              </div>
              <ChevronRight size={16} className="shrink-0 text-text-secondary" />
            </Link>
            <div className="mx-4 border-t border-border" />
            <Link
              href="/inventory?filter=Expiring+Soon"
              className="flex items-center gap-3 rounded-md p-4 transition-colors duration-150 hover:bg-surface-hover"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-warning/10">
                <CalendarClock size={16} className="text-warning" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary">Expiring soon</p>
                <p className="font-numeric text-xs text-text-secondary">
                  {summary.expiringSoonCount} product
                  {summary.expiringSoonCount === 1 ? "" : "s"}
                </p>
              </div>
              <ChevronRight size={16} className="shrink-0 text-text-secondary" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
