"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type DropdownOption = { value: string; label: string };

export function Dropdown({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  className,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn("flex flex-col gap-1.5", className)} ref={ref}>
      {label && <span className="text-sm text-text-secondary">{label}</span>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-border bg-surface px-3 text-left text-sm outline-none transition-colors duration-150",
            open ? "border-accent" : "hover:bg-surface-hover",
            selected ? "text-text-primary" : "text-text-secondary"
          )}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronDown
            size={16}
            className={cn(
              "shrink-0 text-text-secondary transition-transform duration-150",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-60 overflow-y-auto rounded-md border border-border bg-surface py-1 shadow-sm">
            {options.length === 0 ? (
              <p className="px-3 py-2 text-sm text-text-secondary">No options</p>
            ) : (
              options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-surface-hover",
                    o.value === value ? "text-accent" : "text-text-primary"
                  )}
                >
                  <span className="truncate">{o.label}</span>
                  {o.value === value && <Check size={14} className="shrink-0" />}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
