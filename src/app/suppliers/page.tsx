"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Plus, Truck } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

function SupplierForm({
  supplier,
  onDone,
}: {
  supplier: Doc<"suppliers"> | null;
  onDone: () => void;
}) {
  const create = useMutation(api.suppliers.create);
  const update = useMutation(api.suppliers.update);
  const remove = useMutation(api.suppliers.remove);
  const { showToast } = useToast();

  const [name, setName] = useState(supplier?.name ?? "");
  const [contactPerson, setContactPerson] = useState(supplier?.contactPerson ?? "");
  const [phone, setPhone] = useState(supplier?.phone ?? "");
  const [email, setEmail] = useState(supplier?.email ?? "");
  const [address, setAddress] = useState(supplier?.address ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        contactPerson: contactPerson.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      };
      if (supplier) {
        await update({ id: supplier._id, ...payload });
        showToast("Supplier updated");
      } else {
        await create(payload);
        showToast("Supplier added");
      }
      onDone();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!supplier) return;
    if (!confirm(`Remove "${supplier.name}"?`)) return;
    await remove({ id: supplier._id });
    showToast("Supplier removed");
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Supplier name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input
        label="Contact person"
        value={contactPerson}
        onChange={(e) => setContactPerson(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
      <div className="mt-2 flex items-center justify-between gap-3">
        {supplier ? (
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
          {submitting ? "Saving…" : supplier ? "Save changes" : "Add supplier"}
        </Button>
      </div>
    </form>
  );
}

export default function SuppliersPage() {
  const suppliers = useQuery(api.suppliers.list);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Doc<"suppliers"> | null>(null);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(s: Doc<"suppliers">) {
    setEditing(s);
    setModalOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Suppliers"
        actions={
          <Button size="sm" onClick={openAdd}>
            <Plus size={16} /> Add supplier
          </Button>
        }
      />

      <div className="px-4 py-4 sm:px-6">
        {suppliers === undefined ? (
          <p className="py-16 text-center text-sm text-text-secondary">Loading…</p>
        ) : suppliers.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No suppliers yet"
            description="Add a supplier to start recording purchases."
            action={
              <Button size="sm" onClick={openAdd}>
                <Plus size={16} /> Add supplier
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
            {suppliers.map((s) => (
              <button
                key={s._id}
                onClick={() => openEdit(s)}
                className="flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-surface-hover"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">{s.name}</p>
                  <p className="text-xs text-text-secondary">
                    {s.contactPerson || s.phone || "No contact info"}
                  </p>
                </div>
                {s.phone && (
                  <span className="font-numeric shrink-0 text-xs text-text-secondary">
                    {s.phone}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit supplier" : "Add supplier"}
      >
        <SupplierForm supplier={editing} onDone={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
