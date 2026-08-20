"use client";

import { Minus, Plus, X } from "lucide-react";
import { formatKES } from "@/lib/utils";
import type { CartLine } from "@/components/pos/cart";

export function CartItem({
  line,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  line: CartLine;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {line.productName}
        </p>
        <p className="font-numeric text-xs text-text-secondary">
          {formatKES(line.unitPrice)} each
        </p>
      </div>

      <div className="flex items-center gap-1.5 rounded-md border border-border">
        <button
          onClick={onDecrement}
          className="flex h-7 w-7 items-center justify-center text-text-secondary transition-colors duration-150 hover:bg-surface-hover"
        >
          <Minus size={14} />
        </button>
        <span className="font-numeric w-6 text-center text-sm text-text-primary">
          {line.quantity}
        </span>
        <button
          onClick={onIncrement}
          disabled={line.quantity >= line.stock}
          className="flex h-7 w-7 items-center justify-center text-text-secondary transition-colors duration-150 hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={14} />
        </button>
      </div>

      <p className="font-numeric w-20 shrink-0 text-right text-sm text-text-primary">
        {formatKES(line.unitPrice * line.quantity)}
      </p>

      <button
        onClick={onRemove}
        className="text-text-secondary transition-colors duration-150 hover:text-danger"
      >
        <X size={16} />
      </button>
    </div>
  );
}
