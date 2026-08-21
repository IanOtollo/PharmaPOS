"use client";

import { Suspense, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import { PinKeypad } from "@/components/settings/PinKeypad";
import { AUTH_SESSION_KEY, CURRENT_STAFF_KEY, CURRENT_ROLE_KEY } from "@/components/auth/AppGate";

const PIN_LENGTH = 4;

function AuthContent() {
  const settings = useQuery(api.settings.get);
  const staff = useQuery(api.staff.list);
  const logLogin = useMutation(api.audit.logLogin);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/pos";

  const [entry, setEntry] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const ready = settings !== undefined && staff !== undefined;

  useEffect(() => {
    if (!ready || success || entry.length < PIN_LENGTH) return;

    const adminMatch = entry === (settings!.passcode || "1234");
    const staffMatch = staff!.find((s) => s.isActive && s.pin && s.pin === entry);

    if (adminMatch || staffMatch) {
      if (staffMatch) {
        sessionStorage.setItem(CURRENT_STAFF_KEY, staffMatch.name);
        sessionStorage.setItem(CURRENT_ROLE_KEY, staffMatch.role ?? "cashier");
      } else {
        sessionStorage.removeItem(CURRENT_STAFF_KEY);
        sessionStorage.removeItem(CURRENT_ROLE_KEY);
      }
      logLogin({ performedBy: staffMatch?.name });
      setSuccess(true);
    } else {
      setError(true);
      const t = setTimeout(() => {
        setEntry("");
        setError(false);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [entry, ready, success, settings, staff, logLogin]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => {
      sessionStorage.setItem(AUTH_SESSION_KEY, "1");
      router.replace(next);
    }, 450);
    return () => clearTimeout(t);
  }, [success, next, router]);

  function press(key: string) {
    if (key === "" || error || success) return;
    if (key === "delete") {
      setEntry((e) => e.slice(0, -1));
    } else if (entry.length < PIN_LENGTH) {
      setEntry((e) => e + key);
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") {
        press(e.key);
      } else if (e.key === "Backspace") {
        press("delete");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, error]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 text-center">
      <span
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-lg transition-colors duration-150",
          success ? "animate-pin-success bg-success/10" : "bg-accent/10"
        )}
      >
        {success ? (
          <CheckCircle2 size={24} className="text-success" />
        ) : (
          <Lock size={24} className="text-accent" />
        )}
      </span>
      <div>
        <p className="font-display text-lg font-bold text-text-primary">
          {settings?.pharmacyName ?? "PharmaPOS"}
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          {success ? "Welcome back" : "Enter your PIN to continue"}
        </p>
      </div>
      <PinKeypad
        entry={entry}
        targetLength={PIN_LENGTH}
        error={error}
        success={success}
        onPress={press}
      />
    </div>
  );
}

export default function AuthPage() {
  const settings = useQuery(api.settings.get);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <Suspense fallback={<p className="text-sm text-text-secondary">Loading…</p>}>
        <AuthContent />
      </Suspense>
      <p className="absolute bottom-6 left-0 right-0 text-center text-xs text-text-secondary">
        © {new Date().getFullYear()} {settings?.pharmacyName ?? "PharmaPOS"}
      </p>
    </div>
  );
}
