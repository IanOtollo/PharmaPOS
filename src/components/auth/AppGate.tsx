"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopNav } from "@/components/layout/TopNav";

export const AUTH_SESSION_KEY = "pharmapos_unlocked";
export const CURRENT_STAFF_KEY = "pharmapos_current_staff";

export function AppGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(AUTH_SESSION_KEY) === "1");
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!checked || pathname === "/auth") return;
    if (!unlocked) {
      router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
    }
  }, [checked, unlocked, pathname, router]);

  if (pathname === "/auth") {
    return <>{children}</>;
  }

  if (!checked || !unlocked) {
    return <div className="min-h-screen bg-background" />;
  }

  function handleLogout() {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    sessionStorage.removeItem(CURRENT_STAFF_KEY);
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
