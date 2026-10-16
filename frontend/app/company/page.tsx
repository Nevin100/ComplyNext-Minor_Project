/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Card,
  PageHeader,
  Spinner,
  EmptyState,
  ErrorBox,
  OkBox,
} from "@/components/ui";
import { Pencil, Trash2, X } from "lucide-react";

interface Company {
  id: number;
  name: string;
  created_at: string;
}

export default function CompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchCompany = async () => {
    try {
      const res = await api.get("/api/company");
      setCompany(res.data);
      setName(res.data?.name ?? "");
    } catch {
      setError("Could not load the entity profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOk("");
    setSaving(true);
    try {
      const res = await api.put("/api/company", { name });
      setCompany(res.data);
      setEditing(false);
      setOk("Entity profile updated.");
    } catch {
      setError("Could not update the profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError("");
    setDeleting(true);
    try {
      await api.delete("/api/company");
      setCompany(null);
      setConfirmDelete(false);
      setOk("Entity profile deleted.");
    } catch {
      setError("Could not delete the profile.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner label="Loading entity profile…" />;

  return (
    <>
      <PageHeader
        eyebrow="Your institution"
        title="Entity profile"
        desc="The NBFC or co-operative bank this workspace belongs to. Every record in the system is scoped to this entity."
      />

      {error && (
        <div className="mb-4">
          <ErrorBox>{error}</ErrorBox>
        </div>
      )}
      {ok && (
        <div className="mb-4">
          <OkBox>{ok}</OkBox>
        </div>
      )}

      {!company ? (
        <EmptyState
          title="No entity profile"
          desc="The profile was deleted or could not be loaded."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow mb-2">Registered entity</p>
                <h2 className="font-display text-2xl">{company.name}</h2>
                <p className="mono mt-2 text-xs text-[#a8a29e]">
                  entity id: {company.id} · registered{" "}
                  {new Date(company.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditing(!editing);
                  setName(company.name);
                }}
                className="btn-ghost"
              >
                {editing ? (
                  <X className="h-4 w-4" />
                ) : (
                  <>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </>
                )}
              </button>
            </div>

            {editing && (
              <form onSubmit={handleSave} className="mt-5 space-y-3">
                <div>
                  <label className="label">Institution name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </form>
            )}
          </Card>

          <Card>
            <p className="eyebrow mb-2">Data isolation</p>
            <h2 className="font-display text-2xl">Scoped to this entity</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#78716c]">
              Loan books, policies, gap findings and audit logs all belong to{" "}
              <span className="font-medium text-[#1c1917]">{company.name}</span>{" "}
              and to nobody else. The signed session token decides the scope
              — never the client.
            </p>
          </Card>

          <Card className="border-[#fca5a5] lg:col-span-2">
            <h2 className="font-display text-xl text-[#b91c1c]">Danger zone</h2>
            <p className="mt-1.5 text-sm text-[#78716c]">
              Deleting the entity profile removes the company record. This
              action cannot be undone.
            </p>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="btn-ghost mt-4 !border-[#fca5a5] !text-[#b91c1c]"
              >
                <Trash2 className="h-4 w-4" />
                Delete entity profile
              </button>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium">
                  Are you sure? This cannot be undone.
                </span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-primary !bg-[#b91c1c]"
                >
                  {deleting ? "Deleting…" : "Yes, delete it"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
