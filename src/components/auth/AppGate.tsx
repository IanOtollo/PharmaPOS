"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopNav } from "@/components/layout/TopNav";
import {
  AUTH_SESSION_KEY,
  CURRENT_STAFF_KEY,
  CURRENT_ROLE_KEY,
  getRole,
  isPathAllowed,
  defaultPathFor,
} from "@/lib/auth";

export { AUTH_SESSION_KEY, CURRENT_STAFF_KEY, CURRENT_ROLE_KEY };

export function AppGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const isUnlocked = sessionStorage.getItem(AUTH_SESSION_KEY) === "1";
    setUnlocked(isUnlocked);
    setChecked(true);

    if (pathname === "/auth") return;

    if (!isUnlocked) {
      router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
      return;
    }

    const role = getRole();
    if (!isPathAllowed(role, pathname)) {
      router.replace(defaultPathFor(role));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (pathname === "/auth") {
    return <>{children}</>;
  }

  if (!checked || !unlocked || !isPathAllowed(getRole(), pathname)) {
    return <div className="min-h-screen bg-background" />;
  }

  function handleLogout() {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    sessionStorage.removeItem(CURRENT_STAFF_KEY);
    sessionStorage.removeItem(CURRENT_ROLE_KEY);
    router.replace("/auth");
  }

  return (
    <>
      <TopNav onLogout={handleLogout} />
      <div className="pb-24 pt-14 lg:pb-20">{children}</div>
      <BottomNav />
    </>
  );
}
