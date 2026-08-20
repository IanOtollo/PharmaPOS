"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { ReceiptView } from "@/components/sales/ReceiptView";

export default function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const sale = useQuery(api.sales.get, { id: id as Id<"sales"> });
  const router = useRouter();

  return (
    <div className="px-4 py-4 sm:px-6">
      <button
        onClick={() => router.push("/sales")}
        className="no-print mb-4 flex items-center gap-1.5 text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
      >
        <ArrowLeft size={16} /> Back to sales
      </button>

      {sale === undefined ? (
        <p className="py-16 text-center text-sm text-text-secondary">Loading…</p>
      ) : sale === null ? (
        <p className="py-16 text-center text-sm text-text-secondary">Sale not found.</p>
      ) : (
        <ReceiptView sale={sale} />
      )}
    </div>
  );
}
