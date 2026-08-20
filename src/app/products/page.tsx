"use client";

import { Suspense, useState } from "react";
import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { Plus, LayoutGrid, List, Pill } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductForm } from "@/components/products/ProductForm";
import { cn, formatKES } from "@/lib/utils";

function ProductsContent() {
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Doc<"products"> | null>(null);

  const products = useQuery(api.products.search, { term, category });
  const categories = useQuery(api.categories.list);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(p: Doc<"products">) {
    setEditing(p);
    setModalOpen(true);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <PageHeader
        title="Products"
        actions={
          <Button size="sm" onClick={openAdd}>
            <Plus size={16} /> Add product
          </Button>
        }
      />

      <div className="flex flex-col gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <SearchInput
            className="max-w-sm flex-1"
            placeholder="Search products…"
            value={term}
            onChange={setTerm}
          />
          <div className="flex items-center rounded-md border border-border">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-l-md transition-colors duration-150",
                view === "grid" ? "bg-accent text-background" : "text-text-secondary hover:bg-surface-hover"
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-r-md transition-colors duration-150",
                view === "list" ? "bg-accent text-background" : "text-text-secondary hover:bg-surface-hover"
              )}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", ...(categories ?? []).map((c) => c.name)].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors duration-150",
                category === c
                  ? "bg-accent text-background"
                  : "border border-border text-text-secondary hover:bg-surface-hover"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6">
        {products === undefined ? (
          <p className="py-16 text-center text-sm text-text-secondary">Loading…</p>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Pill}
            title="No products found"
            description={
              term || category !== "All"
                ? "Try a different search or category."
                : "Add your first product to get started."
            }
            action={
              !term && category === "All" ? (
                <Button size="sm" onClick={openAdd}>
                  <Plus size={16} /> Add product
                </Button>
              ) : undefined
            }
          />
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} onClick={() => openEdit(p)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
            {products.map((p) => (
              <button
                key={p._id}
                onClick={() => openEdit(p)}
                className="flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-surface-hover"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {p.name}
                  </p>
                  <p className="text-xs text-text-secondary">{p.sku}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge tone="neutral">{p.category}</Badge>
                  <span className="font-numeric text-sm text-accent">
                    {formatKES(p.sellingPrice)}
                  </span>
                  <span className="font-numeric text-xs text-text-secondary w-16 text-right">
                    {p.stock} {p.unit}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit product" : "Add product"}
      >
        <ProductForm product={editing} onDone={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}
