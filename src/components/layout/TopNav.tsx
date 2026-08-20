"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { LogOut, Pill, Receipt, User } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { SearchInput } from "@/components/ui/SearchInput";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { formatKES } from "@/lib/utils";

export function TopNav({ onLogout }: { onLogout: () => void }) {
  const router = useRouter();
  const settings = useQuery(api.settings.get);
  const [term, setTerm] = useState("");
  const [focused, setFocused] = useState(false);

  const trimmed = term.trim();
  const products = useQuery(
    api.products.search,
    trimmed ? { term: trimmed, category: "All" } : "skip"
  );
  const allSales = useQuery(api.sales.list);
  const allStaff = useQuery(api.staff.list);

  const sales = useMemo(() => {
    if (!trimmed || !allSales) return [];
    const t = trimmed.toLowerCase();
    return allSales.filter((s) => s.saleNumber.toLowerCase().includes(t)).slice(0, 5);
  }, [allSales, trimmed]);

  const staff = useMemo(() => {
    if (!trimmed || !allStaff) return [];
    const t = trimmed.toLowerCase();
    return allStaff.filter((s) => s.name.toLowerCase().includes(t)).slice(0, 5);
  }, [allStaff, trimmed]);

  const productResults = (products ?? []).slice(0, 5);
  const loading = trimmed.length > 0 && (products === undefined || !allSales || !allStaff);
  const hasResults = productResults.length > 0 || sales.length > 0 || staff.length > 0;

  function go(path: string) {
    setFocused(false);
    setTerm("");
    router.push(path);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (trimmed) go(`/products?q=${encodeURIComponent(trimmed)}`);
  }

  const showDropdown = focused && trimmed.length > 0;

  return (
    <nav className="no-print fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-4 border-b border-border bg-surface/90 px-4 backdrop-blur-md sm:px-6">
      <span className="hidden shrink-0 font-display text-base font-bold text-text-primary sm:block">
        {settings?.pharmacyName ?? "PharmaPOS"}
      </span>

      <form onSubmit={handleSubmit} className="relative mx-auto w-full max-w-sm">
        <SearchInput
          value={term}
          onChange={setTerm}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search products, sales, staff…"
        />
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-border bg-surface shadow-sm">
            {loading ? (
              <p className="px-3 py-3 text-sm text-text-secondary">Searching…</p>
            ) : !hasResults ? (
              <p className="px-3 py-3 text-sm text-text-secondary">No results found.</p>
            ) : (
              <>
                {productResults.length > 0 && (
                  <div>
                    <p className="px-3 pt-2.5 text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                      Products
                    </p>
                    {productResults.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => go(`/products?q=${encodeURIComponent(p.name)}`)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-surface-hover"
                      >
                        <Pill size={14} className="shrink-0 text-text-secondary" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-text-primary">{p.name}</p>
                          <p className="font-numeric text-xs text-text-secondary">
                            {p.stock} {p.unit}
                          </p>
                        </div>
                        <span className="font-numeric shrink-0 text-sm text-accent">
                          {formatKES(p.sellingPrice)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {sales.length > 0 && (
                  <div>
                    <p className="border-t border-border px-3 pt-2.5 text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                      Sales
                    </p>
                    {sales.map((s) => (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => go(`/sales/${s._id}`)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-surface-hover"
                      >
                        <Receipt size={14} className="shrink-0 text-text-secondary" />
                        <div className="min-w-0 flex-1">
                          <p className="font-numeric truncate text-sm text-text-primary">
                            {s.saleNumber}
                          </p>
                        </div>
                        <span className="font-numeric shrink-0 text-sm text-accent">
                          {formatKES(s.totalAmount)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {staff.length > 0 && (
                  <div>
                    <p className="border-t border-border px-3 pt-2.5 text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                      Staff
                    </p>
                    {staff.map((s) => (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => go("/settings")}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-surface-hover"
                      >
                        <User size={14} className="shrink-0 text-text-secondary" />
                        <span className="truncate text-sm text-text-primary">{s.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </form>

      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <button
          onClick={onLogout}
          aria-label="Logout"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-text-secondary transition-colors duration-150 hover:text-danger"
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
