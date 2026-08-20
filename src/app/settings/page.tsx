"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { User, UserPlus, X, Tag, Plus, History } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime } from "@/lib/utils";

const AUDIT_LABEL: Record<string, string> = {
  "product.create": "Product added",
  "product.update": "Product updated",
  "product.remove": "Product removed",
  "sale.void": "Sale voided",
  "staff.create": "Staff added",
  "staff.remove": "Staff removed",
  "settings.update": "Settings updated",
  "purchase.create": "Purchase recorded",
};

function GeneralSettings() {
  const settings = useQuery(api.settings.get);
  const update = useMutation(api.settings.update);
  const { showToast } = useToast();

  const [pharmacyName, setPharmacyName] = useState("");
  const [currentPasscode, setCurrentPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (settings) {
      setPharmacyName(settings.pharmacyName);
    }
  }, [settings]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pharmacyName.trim() || !settings) return;
    setError("");

    const storedPasscode = settings.passcode || "1234";
    let passcodeToSave = storedPasscode;

    if (newPasscode.trim()) {
      if (currentPasscode.trim() !== storedPasscode) {
        setError("Current passcode is incorrect");
        return;
      }
      passcodeToSave = newPasscode.trim();
    }

    setSubmitting(true);
    try {
      await update({
        pharmacyName: pharmacyName.trim(),
        passcode: passcodeToSave,
      });
      setCurrentPasscode("");
      setNewPasscode("");
      showToast("Settings saved");
    } finally {
      setSubmitting(false);
    }
  }

  if (settings === undefined) {
    return <p className="py-16 text-center text-sm text-text-secondary">Loading…</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full flex-col gap-4 rounded-lg border border-border bg-surface p-6"
    >
      <div>
        <p className="font-display text-base font-bold text-text-primary">General</p>
        <p className="mt-1 text-sm text-text-secondary">
          The pharmacy name appears on every receipt. The passcode unlocks this
          device.
        </p>
      </div>

      <Input
        label="Pharmacy name"
        value={pharmacyName}
        onChange={(e) => setPharmacyName(e.target.value)}
        placeholder="e.g. Riverside Pharmacy"
        required
      />

      <div className="border-t border-border pt-4">
        <p className="text-sm text-text-secondary">
          To change the admin passcode, confirm the current one first.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Input
            label="Current passcode"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={currentPasscode}
            onChange={(e) => setCurrentPasscode(e.target.value)}
            placeholder="••••"
          />
          <Input
            label="New passcode"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={newPasscode}
            onChange={(e) => setNewPasscode(e.target.value)}
            placeholder="e.g. 4-digit PIN"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}

function StaffSettings() {
  const staff = useQuery(api.staff.list);
  const create = useMutation(api.staff.create);
  const remove = useMutation(api.staff.remove);
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await create({ name: name.trim(), pin: pin.trim() || undefined });
      setName("");
      setPin("");
      showToast("Staff member added");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: Parameters<typeof remove>[0]["id"], staffName: string) {
    if (!confirm(`Remove "${staffName}" from staff?`)) return;
    await remove({ id });
    showToast("Staff member removed");
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-surface p-6">
      <p className="font-display text-base font-bold text-text-primary">Staff</p>
      <p className="mt-1 text-sm text-text-secondary">
        Staff added here can be selected as the cashier at checkout.
      </p>

      <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-2">
        <div className="relative">
          <User
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <Input
            className="pl-9"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Staff name, e.g. Jane Wanjiru"
          />
        </div>
        <div className="flex gap-2">
          <Input
            className="min-w-0 flex-1"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
          />
          <Button type="submit" size="md" disabled={submitting} className="shrink-0">
            <UserPlus size={16} /> Add
          </Button>
        </div>
      </form>

      <div className="mt-4 flex flex-1 flex-col divide-y divide-border overflow-y-auto">
        {staff === undefined ? (
          <p className="py-4 text-sm text-text-secondary">Loading…</p>
        ) : staff.length === 0 ? (
          <p className="py-4 text-sm text-text-secondary">No staff added yet.</p>
        ) : (
          staff.map((s) => (
            <div key={s._id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-primary">{s.name}</span>
                {s.pin ? (
                  <span className="rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                    PIN set
                  </span>
                ) : (
                  <span className="rounded-md bg-surface-hover px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
                    No PIN
                  </span>
                )}
              </div>
              <button
                onClick={() => handleRemove(s._id, s.name)}
                className="text-text-secondary transition-colors duration-150 hover:text-danger"
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CategorySettings() {
  const categories = useQuery(api.categories.list);
  const create = useMutation(api.categories.create);
  const remove = useMutation(api.categories.remove);
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      await create({ name: name.trim() });
      setName("");
      showToast("Category added");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: Parameters<typeof remove>[0]["id"], catName: string) {
    if (!confirm(`Remove category "${catName}"?`)) return;
    await remove({ id });
    showToast("Category removed");
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-surface p-6">
      <p className="font-display text-base font-bold text-text-primary">Categories</p>
      <p className="mt-1 text-sm text-text-secondary">
        Categories appear as filter tabs in Products and POS.
      </p>

      <form onSubmit={handleAdd} className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <Tag
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <Input
            className="pl-9"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Vitamins"
          />
        </div>
        <Button type="submit" size="md" disabled={submitting}>
          <Plus size={16} />
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      <div className="mt-4 flex flex-1 flex-col divide-y divide-border overflow-y-auto">
        {categories === undefined ? (
          <p className="py-4 text-sm text-text-secondary">Loading…</p>
        ) : categories.length === 0 ? (
          <p className="py-4 text-sm text-text-secondary">No categories yet.</p>
        ) : (
          categories.map((c) => (
            <div key={c._id} className="flex items-center justify-between py-3">
              <span className="text-sm text-text-primary">{c.name}</span>
              <button
                onClick={() => handleRemove(c._id, c.name)}
                className="text-text-secondary transition-colors duration-150 hover:text-danger"
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AuditLogSettings() {
  const logs = useQuery(api.audit.list);

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-surface p-6">
      <div className="flex items-center gap-2">
        <History size={16} className="text-text-secondary" />
        <p className="font-display text-base font-bold text-text-primary">Audit Log</p>
      </div>
      <p className="mt-1 text-sm text-text-secondary">Recent administrative activity.</p>

      <div className="mt-4 flex flex-1 flex-col divide-y divide-border overflow-y-auto">
        {logs === undefined ? (
          <p className="py-4 text-sm text-text-secondary">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="py-4 text-sm text-text-secondary">No activity yet.</p>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="py-2.5">
              <p className="text-sm text-text-primary">{log.description}</p>
              <p className="mt-0.5 text-xs text-text-secondary">
                {AUDIT_LABEL[log.action] ?? log.action} · {formatDateTime(log._creationTime)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col lg:h-[calc(100vh-8.5rem)]">
      <PageHeader title="Settings" />
      <div className="flex flex-col gap-4 px-4 pb-4 sm:px-6 lg:min-h-0 lg:flex-1 lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-hidden lg:pb-0 xl:grid-cols-4">
        <GeneralSettings />
        <StaffSettings />
        <CategorySettings />
        <AuditLogSettings />
      </div>
    </div>
  );
}
