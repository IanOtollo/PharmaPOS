"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Plus, Users } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatKES, formatDateTime } from "@/lib/utils";

function CustomerForm({
  customer,
  onDone,
}: {
  customer: Doc<"customers"> | null;
  onDone: () => void;
}) {
  const create = useMutation(api.customers.create);
  const update = useMutation(api.customers.update);
  const remove = useMutation(api.customers.remove);
  const { showToast } = useToast();

  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [address, setAddress] = useState(customer?.address ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      };
      if (customer) {
        await update({ id: customer._id, ...payload });
        showToast("Customer updated");
      } else {
        await create(payload);
        showToast("Customer added");
      }
      onDone();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!customer) return;
    if (!confirm(`Remove "${customer.name}"?`)) return;
    await remove({ id: customer._id });
    showToast("Customer removed");
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
      <div className="mt-2 flex items-center justify-between gap-3">
        {customer ? (
          <Button
            type="button"
            variant="ghost"
            className="text-danger hover:bg-danger/10"
            onClick={handleDelete}
          >
            Delete
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : customer ? "Save changes" : "Add customer"}
        </Button>
      </div>
    </form>
  );
}

function PurchaseHistoryModal({
  phone,
  onClose,
}: {
  phone: string | null;
  onClose: () => void;
}) {
  const sales = useQuery(api.customers.purchaseHistory, phone ? { phone } : "skip");

  return (
    <Modal open={!!phone} onClose={onClose} title="Purchase history">
      {sales === undefined ? (
        <p className="py-8 text-center text-sm text-text-secondary">Loading…</p>
      ) : sales.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-secondary">No purchases yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {sales.map((s) => (
            <div key={s._id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-numeric text-sm text-text-primary">{s.saleNumber}</p>
                <p className="text-xs text-text-secondary">{formatDateTime(s._creationTime)}</p>
              </div>
              <span className="font-numeric text-sm text-accent">
                {formatKES(s.totalAmount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default function CustomersPage() {
  const [term, setTerm] = useState("");
  const customers = useQuery(api.customers.search, { term });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Doc<"customers"> | null>(null);
  const [historyPhone, setHistoryPhone] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(c: Doc<"customers">) {
    setEditing(c);
    setModalOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        actions={
          <Button size="sm" onClick={openAdd}>
            <Plus size={16} /> Add customer
          </Button>
        }
      />

      <div className="px-4 sm:px-6">
        <SearchInput
          className="max-w-sm"
          placeholder="Search customers…"
          value={term}
          onChange={setTerm}
        />
      </div>

      <div className="px-4 py-4 sm:px-6">
        {customers === undefined ? (
          <p className="py-16 text-center text-sm text-text-secondary">Loading…</p>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Customers are added automatically at checkout, or add one manually."
            action={
              <Button size="sm" onClick={openAdd}>
                <Plus size={16} /> Add customer
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
            {customers.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-150 hover:bg-surface-hover"
              >
                <button
                  onClick={() => openEdit(c)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-sm font-medium text-text-primary">{c.name}</p>
                  <p className="font-numeric text-xs text-text-secondary">
                    {c.phone || "No phone"}
                  </p>
                </button>
                {c.phone && (
                  <button
                    onClick={() => setHistoryPhone(c.phone!)}
                    className="shrink-0 text-sm text-accent transition-colors duration-150 hover:text-accent-hover"
                  >
                    History
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit customer" : "Add customer"}
      >
        <CustomerForm customer={editing} onDone={() => setModalOpen(false)} />
      </Modal>

      <PurchaseHistoryModal phone={historyPhone} onClose={() => setHistoryPhone(null)} />
    </div>
  );
}
