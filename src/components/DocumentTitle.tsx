"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const PAGE_LABELS: { prefix: string; label: string }[] = [
  { prefix: "/auth", label: "Sign in" },
  { prefix: "/pos", label: "POS" },
  { prefix: "/dashboard", label: "Dashboard" },
  { prefix: "/products", label: "Products" },
  { prefix: "/inventory", label: "Inventory" },
  { prefix: "/customers", label: "Customers" },
  { prefix: "/suppliers", label: "Suppliers" },
  { prefix: "/purchases", label: "Purchases" },
  { prefix: "/sales", label: "Sales" },
  { prefix: "/reports", label: "Reports" },
  { prefix: "/settings", label: "Settings" },
];

function pageLabelFor(pathname: string): string | null {
  const match = PAGE_LABELS.find(
    (p) => pathname === p.prefix || pathname.startsWith(p.prefix + "/")
  );
  return match?.label ?? null;
}

export function DocumentTitle() {
  const settings = useQuery(api.settings.get);
  const pathname = usePathname();

  useEffect(() => {
    const pharmacyName = settings?.pharmacyName ?? "PharmaPOS";
    const label = pageLabelFor(pathname);
    document.title = label ? `${label} — ${pharmacyName}` : pharmacyName;
  }, [settings, pathname]);

  return null;
}
