"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { Receipt, Users } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { SaleRow } from "@/components/sales/SaleRow";
import { cn } from "@/lib/utils";
import { getRole } from "@/lib/auth";

const DATE_FILTERS = ["Today", "This Week", "This Month", "All"] as const;
const METHOD_FILTERS = ["All", "cash", "mpesa", "card"] as const;

function isWithin(days: number, timestamp: number) {
  return Date.now() - timestamp <= days * 24 * 60 * 60 * 1000;
}

export default function SalesPage() {
  const [term, setTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<(typeof DATE_FILTERS)[number]>("All");
  const [methodFilter, setMethodFilter] = useState<(typeof METHOD_FILTERS)[number]>("All");
  const [isAdmin, setIsAdmin] = useState(false);
  const sales = useQuery(api.sales.list);

  useEffect(() => {
    setIsAdmin(getRole() === "admin");
  }, []);

  const filtered = useMemo(() => {
    if (!sales) return undefined;
    let list = sales;
    if (term.trim()) {
      const t = term.trim().toLowerCase();
      list = list.filter((s) => s.saleNumber.toLowerCase().includes(t));
    }
    if (dateFilter === "Today") {
      list = list.filter((s) => isWithin(1, s._creationTime));
    } else if (dateFilter === "This Week") {
      list = list.filter((s) => isWithin(7, s._creationTime));
    } else if (dateFilter === "This Month") {
      list = list.filter((s) => isWithin(30, s._creationTime));
    }
    if (methodFilter !== "All") {
      list = list.filter((s) => s.paymentMethod === methodFilter);
    }
    return list;
  }, [sales, term, dateFilter, methodFilter]);

  return (
    <div>
      <PageHeader
        title="Sales History"
        actions={
          isAdmin ? (
            <Link href="/customers">
              <Button size="sm" variant="secondary">
                <Users size={16} /> Customers
              </Button>
            </Link>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 px-4 sm:px-6">
        <SearchInput
          className="max-w-sm"
          placeholder="Search by sale number…"
          value={term}
          onChange={setTerm}
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {DATE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors duration-150",
                dateFilter === f
                  ? "bg-accent text-background"
                  : "border border-border text-text-secondary hover:bg-surface-hover"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {METHOD_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setMethodFilter(f)}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-sm capitalize transition-colors duration-150",
                methodFilter === f
                  ? "bg-accent text-background"
                  : "border border-border text-text-secondary hover:bg-surface-hover"
              )}
            >
              {f === "mpesa" ? "M-Pesa" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6">
        {filtered === undefined ? (
          <p className="py-16 text-center text-sm text-text-secondary">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No sales found"
            description="Sales will appear here once you complete a checkout."
          />
        ) : (
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
            {filtered.map((s) => (
              <SaleRow key={s._id} sale={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
