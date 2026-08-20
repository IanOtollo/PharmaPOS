import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{label}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10">
          <Icon size={16} className="text-accent" />
        </span>
      </div>
      <p className="font-numeric text-2xl text-text-primary sm:text-3xl">{value}</p>
    </div>
  );
}
