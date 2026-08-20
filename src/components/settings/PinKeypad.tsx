"use client";

import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "delete"];

export function PinKeypad({
  entry,
  targetLength,
  error,
  success,
  onPress,
}: {
  entry: string;
  targetLength: number;
  error: boolean;
  success?: boolean;
  onPress: (key: string) => void;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div
        className={cn("flex gap-4", error && "animate-shake")}
        key={error ? "error" : "idle"}
      >
        {Array.from({ length: targetLength }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-4 w-4 rounded-full border-2 transition-colors duration-150",
              success
                ? "animate-pin-success border-success bg-success"
                : i < entry.length
                  ? error
                    ? "border-danger bg-danger"
                    : "border-accent bg-accent"
                  : "border-border bg-transparent"
            )}
            style={success ? { animationDelay: `${i * 60}ms` } : undefined}
          />
        ))}
      </div>
      {error && <p className="text-sm text-danger">Incorrect passcode</p>}
      {success && <p className="text-sm text-success">Unlocked</p>}

      <div className="mx-auto grid w-full max-w-[300px] grid-cols-3 gap-4">
        {KEYS.map((key, i) =>
          key === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              disabled={success}
              onClick={() => onPress(key)}
              className="flex h-16 w-full items-center justify-center rounded-lg border border-border bg-surface font-numeric text-xl text-text-primary transition-colors duration-150 hover:bg-surface-hover active:scale-[0.98] disabled:opacity-50"
            >
              {key === "delete" ? <Delete size={20} /> : key}
            </button>
          )
        )}
      </div>
    </div>
  );
}
