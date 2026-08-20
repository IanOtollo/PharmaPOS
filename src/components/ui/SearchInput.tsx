import { InputHTMLAttributes, forwardRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

export const SearchInput = forwardRef<HTMLInputElement, Props>(
  ({ className, value, onChange, placeholder = "Search…", ...props }, ref) => {
    return (
      <div className={cn("relative", className)}>
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
        />
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-9 text-sm text-text-primary placeholder:text-text-secondary outline-none transition-colors duration-150 focus:border-accent"
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full p-0.5 text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";
