"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Download, Package, Wallet } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { RevenueChart } from "@/components/reports/RevenueChart";
import { CategoryBreakdown } from "@/components/reports/CategoryBreakdown";
import { formatKES, formatDateTime, cn } from "@/lib/utils";

const RANGES = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "All time", value: 0 },
];

const METHOD_LABEL: Record<string, string> = {
  cash: "Cash",
  mpesa: "M-Pesa",
  card: "Card",
};

function StatTile({ label, value, tone }: { label: string; value: string; tone?: "accent" | "primary" }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-sm text-text-secondary">{label}</p>
      <p
        className={cn(
          "font-numeric mt-2 text-2xl",
          tone === "accent" ? "text-accent" : "text-text-primary"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function downloadCsv(rows: (string | number)[][], filename: string) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell);
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [rangeDays, setRangeDays] = useState(30);
  const report = useQuery(api.reports.summary, { rangeDays });
  const valuation = useQuery(api.reports.inventoryValuation);

  const totalPayments = report
    ? Object.values(report.paymentBreakdown).reduce((a, b) => a + b, 0)
    : 0;

  function exportTransactions() {
    if (!report) return;
    const rows: (string | number)[][] = [
      ["Sale Number", "Date", "Items", "Payment Method", "Served By", "Total (KES)"],
      ...report.transactions.map((t) => [
        t.saleNumber,
        formatDateTime(t.date),
        t.itemCount,
        METHOD_LABEL[t.paymentMethod] ?? t.paymentMethod,
        t.servedBy ?? "",
        t.totalAmount.toFixed(2),
      ]),
    ];
    downloadCsv(rows, `pharmapos-sales-${rangeDays || "all"}days.csv`);
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        actions={
          report && report.transactions.length > 0 ? (
            <Button size="sm" variant="secondary" onClick={exportTransactions}>
              <Download size={16} /> Export CSV
            </Button>
          ) : undefined
        }
      />

      <div className="flex gap-2 overflow-x-auto px-4 pb-1 sm:px-6">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRangeDays(r.value)}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors duration-150",
              rangeDays === r.value
                ? "bg-accent text-background"
                : "border border-border text-text-secondary hover:bg-surface-hover"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {report === undefined ? (
        <p className="px-4 py-16 text-center text-sm text-text-secondary sm:px-6">
          Loading…
        </p>
      ) : (
        <div className="px-4 py-4 sm:px-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatTile label="Total Revenue" value={formatKES(report.totalRevenue)} tone="accent" />
            <StatTile label="Gross Profit" value={formatKES(report.grossProfit)} tone="accent" />
            <StatTile label="Margin" value={`${report.marginPercent.toFixed(1)}%`} />
            <StatTile label="Total Sales" value={String(report.totalSales)} />
            <StatTile label="Items Sold" value={String(report.totalItems)} />
            <StatTile label="Avg Sale Value" value={formatKES(report.avgSale)} />
          </div>

          <div className="mt-4 rounded-lg border border-border bg-surface p-6">
            <p className="mb-4 font-display text-base font-bold text-text-primary">
              Revenue trend
            </p>
            <RevenueChart data={report.daily} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-6">
              <p className="mb-4 font-display text-base font-bold text-text-primary">
                Revenue by category
              </p>
              <CategoryBreakdown data={report.categoryBreakdown} />
            </div>

            <div className="rounded-lg border border-border bg-surface p-6">
              <p className="mb-4 font-display text-base font-bold text-text-primary">
                Payment methods
              </p>
              {totalPayments === 0 ? (
                <p className="text-sm text-text-secondary">No sales for this period.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {Object.entries(report.paymentBreakdown).map(([method, amount]) => (
                    <div key={method} className="flex items-center gap-3">
                      <span className="w-16 shrink-0 text-sm text-text-primary">
                        {METHOD_LABEL[method] ?? method}
                      </span>
                      <div className="h-1.5 flex-1 rounded-full bg-surface-hover">
                        <div
                          className="h-1.5 rounded-full bg-accent"
                          style={{ width: `${(amount / totalPayments) * 100}%` }}
                        />
                      </div>
                      <span className="font-numeric w-20 shrink-0 text-right text-xs text-text-secondary">
                        {formatKES(amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-6">
              <p className="mb-4 font-display text-base font-bold text-text-primary">
                Cashier performance
              </p>
              {report.staffPerformance.length === 0 ? (
                <p className="text-sm text-text-secondary">No sales for this period.</p>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {report.staffPerformance.map((s) => (
                    <div key={s.name} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-text-primary">{s.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-numeric text-xs text-text-secondary">
                          {s.sales} sale{s.sales === 1 ? "" : "s"}
                        </span>
                        <span className="font-numeric w-20 text-right text-sm text-accent">
                          {formatKES(s.revenue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border bg-surface p-6">
              <p className="mb-4 font-display text-base font-bold text-text-primary">
                Inventory valuation
              </p>
              {valuation === undefined ? (
                <p className="text-sm text-text-secondary">Loading…</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10">
                      <Wallet size={16} className="text-accent" />
                    </span>
                    <div>
                      <p className="text-xs text-text-secondary">Cost value</p>
                      <p className="font-numeric text-sm text-text-primary">
                        {formatKES(valuation.costValue)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10">
                      <Package size={16} className="text-accent" />
                    </span>
                    <div>
                      <p className="text-xs text-text-secondary">Retail value</p>
                      <p className="font-numeric text-sm text-text-primary">
                        {formatKES(valuation.retailValue)}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-text-secondary">
                    {valuation.productCount} active product
                    {valuation.productCount === 1 ? "" : "s"} in stock
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-surface p-6">
            <p className="mb-4 font-display text-base font-bold text-text-primary">
              Top products
            </p>
            {report.topProducts.length === 0 ? (
              <p className="text-sm text-text-secondary">No sales for this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-text-secondary">
                      <th className="py-2 pr-4 font-medium">Product</th>
                      <th className="py-2 pr-4 font-medium">Qty sold</th>
                      <th className="py-2 font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.topProducts.map((p) => (
                      <tr key={p.name} className="text-text-primary">
                        <td className="py-2 pr-4">{p.name}</td>
                        <td className="font-numeric py-2 pr-4 text-text-secondary">
                          {p.quantity}
                        </td>
                        <td className="font-numeric py-2 text-accent">
                          {formatKES(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-lg border border-border bg-surface p-6">
            <p className="mb-4 font-display text-base font-bold text-text-primary">
              Transactions
            </p>
            {report.transactions.length === 0 ? (
              <p className="text-sm text-text-secondary">No sales for this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-text-secondary">
                      <th className="py-2 pr-4 font-medium">Sale No.</th>
                      <th className="py-2 pr-4 font-medium">Date</th>
                      <th className="py-2 pr-4 font-medium">Cashier</th>
                      <th className="py-2 pr-4 font-medium">Payment</th>
                      <th className="py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.transactions.map((t) => (
                      <tr key={t.id} className="text-text-primary">
                        <td className="font-numeric py-2 pr-4">{t.saleNumber}</td>
                        <td className="font-numeric py-2 pr-4 text-text-secondary">
                          {formatDateTime(t.date)}
                        </td>
                        <td className="py-2 pr-4 text-text-secondary">{t.servedBy ?? "—"}</td>
                        <td className="py-2 pr-4 text-text-secondary">
                          {METHOD_LABEL[t.paymentMethod] ?? t.paymentMethod}
                        </td>
                        <td className="font-numeric py-2 text-accent">
                          {formatKES(t.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
