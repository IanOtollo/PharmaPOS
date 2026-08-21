"use client";

import { ShoppingCart } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CartItem } from "@/components/pos/CartItem";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatKES, calculateVAT } from "@/lib/utils";
import type { CartLine } from "@/components/pos/cart";

export function CartPanel({
  lines,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
  onCheckout,
}: {
  lines: CartLine[];
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCheckout: () => void;
}) {
  const settings = useQuery(api.settings.get);
  const vatRate = settings?.vatRate ?? 0.16;
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const { vat, total } = calculateVAT(subtotal, vatRate);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-display text-base font-bold text-text-primary">Cart</h2>
        {lines.length > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-text-secondary transition-colors duration-150 hover:text-danger"
          >
            Clear cart
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {lines.length === 0 ? (
          <div className="py-8">
            <EmptyState
              icon={ShoppingCart}
              title="Cart is empty"
              description="Add products to start a sale."
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {lines.map((line) => (
              <CartItem
                key={line.productId}
                line={line}
                onIncrement={() => onIncrement(line.productId)}
                onDecrement={() => onDecrement(line.productId)}
                onRemove={() => onRemove(line.productId)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>Subtotal</span>
          <span className="font-numeric">{formatKES(subtotal)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm text-text-secondary">
          <span>VAT ({Math.round(vatRate * 100)}%)</span>
          <span className="font-numeric">{formatKES(vat)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-base font-medium text-text-primary">
          <span>Total</span>
          <span className="font-numeric text-accent">{formatKES(total)}</span>
        </div>

        <Button
          size="lg"
          className="mt-4 w-full"
          disabled={lines.length === 0}
          onClick={onCheckout}
        >
          Charge {formatKES(total)}
        </Button>
      </div>
    </div>
  );
}
