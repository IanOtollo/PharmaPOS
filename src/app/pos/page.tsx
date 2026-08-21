"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { ShoppingCart, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { CartPanel } from "@/components/pos/CartPanel";
import { CheckoutModal } from "@/components/pos/CheckoutModal";
import { useToast } from "@/components/ui/Toast";
import { formatKES, calculateVAT } from "@/lib/utils";
import type { CartLine } from "@/components/pos/cart";

export default function PosPage() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const { showToast } = useToast();

  function addProduct(product: Doc<"products">) {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((l) =>
          l.productId === product._id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          productName: product.name,
          unitPrice: product.sellingPrice,
          quantity: 1,
          stock: product.stock,
        },
      ];
    });
  }

  function increment(id: string) {
    setLines((prev) =>
      prev.map((l) =>
        l.productId === id && l.quantity < l.stock
          ? { ...l, quantity: l.quantity + 1 }
          : l
      )
    );
  }

  function decrement(id: string) {
    setLines((prev) =>
      prev
        .map((l) =>
          l.productId === id ? { ...l, quantity: l.quantity - 1 } : l
        )
        .filter((l) => l.quantity > 0)
    );
  }

  function remove(id: string) {
    setLines((prev) => prev.filter((l) => l.productId !== id));
  }

  function clear() {
    setLines([]);
  }

  function handleComplete() {
    setLines([]);
    setCheckoutOpen(false);
    setMobileCartOpen(false);
    showToast("Sale completed");
  }

  const settings = useQuery(api.settings.get);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const { total } = calculateVAT(subtotal, settings?.vatRate ?? 0.16);

  return (
    <div className="lg:flex lg:h-[calc(100vh-8.5rem)]">
      <div className="lg:w-2/3 lg:overflow-y-auto">
        <PageHeader title="Point of Sale" />
        <div className="px-4 pb-24 sm:px-6 lg:pb-6">
          <ProductSearch onAdd={addProduct} />
        </div>
      </div>

      <div className="hidden border-l border-border lg:block lg:w-1/3">
        <CartPanel
          lines={lines}
          onIncrement={increment}
          onDecrement={decrement}
          onRemove={remove}
          onClear={clear}
          onCheckout={() => setCheckoutOpen(true)}
        />
      </div>

      {lines.length > 0 && (
        <button
          onClick={() => setMobileCartOpen(true)}
          className="no-print fixed bottom-24 left-4 right-4 z-40 flex items-center justify-between rounded-lg bg-accent px-4 py-3 text-background shadow-sm lg:hidden"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <ShoppingCart size={18} />
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </span>
          <span className="font-numeric text-sm font-medium">{formatKES(total)}</span>
        </button>
      )}

      {mobileCartOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-background lg:hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="font-display text-base font-bold text-text-primary">Cart</h2>
            <button
              onClick={() => setMobileCartOpen(false)}
              className="rounded-md p-1.5 text-text-secondary hover:bg-surface-hover"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden pb-16">
            <CartPanel
              lines={lines}
              onIncrement={increment}
              onDecrement={decrement}
              onRemove={remove}
              onClear={clear}
              onCheckout={() => setCheckoutOpen(true)}
            />
          </div>
        </div>
      )}

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        lines={lines}
        onComplete={handleComplete}
      />
    </div>
  );
}
