"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Pill,
  Package,
  Receipt,
  LayoutDashboard,
  BarChart3,
  Settings,
  Users,
  Truck,
  ShoppingBasket,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getRole } from "@/lib/auth";
import { Modal } from "@/components/ui/Modal";

type NavItem = { href: string; label: string; icon: typeof Pill; desktopOnly?: boolean };

const LEFT_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Pill },
  { href: "/inventory", label: "Inventory", icon: Package, desktopOnly: true },
  { href: "/customers", label: "Customers", icon: Users, desktopOnly: true },
];

const RIGHT_ITEMS: NavItem[] = [
  { href: "/suppliers", label: "Suppliers", icon: Truck, desktopOnly: true },
  { href: "/purchases", label: "Purchases", icon: ShoppingBasket, desktopOnly: true },
  { href: "/sales", label: "Sales", icon: Receipt },
  { href: "/reports", label: "Reports", icon: BarChart3, desktopOnly: true },
  { href: "/settings", label: "Settings", icon: Settings, desktopOnly: true },
];

const MORE_ITEMS: NavItem[] = [...LEFT_ITEMS, ...RIGHT_ITEMS].filter((i) => i.desktopOnly);

const POS_ITEM = { href: "/pos", label: "POS", icon: ShoppingCart };

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  desktopOnly,
}: NavItem & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "relative flex flex-1 flex-col items-center justify-center gap-0.5 px-0.5 transition-colors duration-150",
        desktopOnly && "hidden lg:flex",
        active ? "text-accent" : "text-text-secondary hover:text-text-primary"
      )}
    >
      {active && <span className="absolute top-1 h-1 w-1 rounded-full bg-accent" />}
      <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
      <span className="whitespace-nowrap text-[8px] font-medium leading-tight tracking-tight sm:text-[11px] sm:tracking-normal">
        {label}
      </span>
    </Link>
  );
}

function MoreButton({ onClick, active }: { onClick: () => void; active: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label="More"
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-0.5 px-0.5 transition-colors duration-150 lg:hidden",
        active ? "text-accent" : "text-text-secondary hover:text-text-primary"
      )}
    >
      <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
      <span className="whitespace-nowrap text-[8px] font-medium leading-tight tracking-tight sm:text-[11px] sm:tracking-normal">
        More
      </span>
    </button>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [isStaff, setIsStaff] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setIsStaff(getRole() === "staff");
  }, []);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const leftItems = isStaff ? [] : LEFT_ITEMS;
  const rightItems = isStaff
    ? RIGHT_ITEMS.filter((i) => i.href === "/sales")
    : RIGHT_ITEMS;
  const moreActive = MORE_ITEMS.some((i) => isActive(i.href));

  return (
    <>
      <nav className="no-print fixed inset-x-4 bottom-4 z-50 mx-auto h-16 max-w-3xl rounded-lg border border-border bg-surface shadow-sm lg:h-14 lg:max-w-5xl">
        <div className="mx-auto flex h-full items-stretch justify-evenly">
          {leftItems.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}

          <div className="flex flex-1 items-center justify-center">
            <Link
              href={POS_ITEM.href}
              aria-label={POS_ITEM.label}
              className={cn(
                "flex h-14 w-14 -translate-y-4 flex-col items-center justify-center gap-0.5 rounded-full border shadow-sm transition-colors duration-150 lg:h-12 lg:w-12 lg:-translate-y-3",
                isActive(POS_ITEM.href)
                  ? "border-accent-hover bg-accent text-background"
                  : "border-accent-hover bg-accent text-background hover:bg-accent-hover"
              )}
            >
              <POS_ITEM.icon size={22} strokeWidth={2} />
              <span className="text-[9px] font-medium">{POS_ITEM.label}</span>
            </Link>
          </div>

          {rightItems.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}

          {!isStaff && (
            <MoreButton onClick={() => setMoreOpen(true)} active={moreActive} />
          )}
        </div>
      </nav>

      {!isStaff && (
        <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="More">
          <div className="grid grid-cols-3 gap-3">
            {MORE_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center transition-colors duration-150 hover:bg-surface-hover",
                  isActive(item.href) && "border-accent-hover text-accent"
                )}
              >
                <item.icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
