/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Card,
  PageHeader,
  Pill,
  Spinner,
  EmptyState,
  ErrorBox,
  OkBox,
} from "@/components/ui";

interface Loan {
  id: number;
  account_no: string;
  borrower_name: string;
  account_type: string;
  days_past_due: number;
  outstanding: number;
  computed_classification: string | null;
  rule_reason: string | null;
}

const EMPTY_FORM = {
  account_no: "",
  borrower_name: "",
  account_type: "term_loan",
  days_past_due: "",
  outstanding: "",
  existing_classification: "",
};

export default function ClassifyPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [classifyMsg, setClassifyMsg] = useState("");
  const [classifying, setClassifying] = useState(false);

  const fetchLoans = async () => {
    try {
      const res = await api.get("/api/loans");
      setLoans(res.data ?? []);
    } catch {
      setError("Could not load loan accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOk("");
    setSubmitting(true);
    try {
      await api.post("/api/loans", {
        account_no: form.account_no,
        borrower_name: form.borrower_name,
        account_type: form.account_type,
        days_past_due: Number(form.days_past_due),
        outstanding: Number(form.outstanding),
        existing_classification: form.existing_classification || null,
      });
      setForm(EMPTY_FORM);
      setOk("Loan account added.");
      fetchLoans();
    } catch {
      setError("Could not add the loan account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClassify = async () => {
    setClassifyMsg("");
    setClassifying(true);
    try {
      const res = await api.post("/api/classify");
      setClassifyMsg(
        res.data?.message ??
          `${res.data?.length ?? 0} accounts re-classified against the current corpus.`
      );
      fetchLoans();
    } catch {
      setError("Classification run failed.");
    } finally {
      setClassifying(false);
    }
  };

  if (loading) return <Spinner label="Loading loan accounts…" />;

  const mismatches = loans.filter(
    (l) => l.computed_classification && l.rule_reason?.startsWith("MISMATCH")
  );

  return (
    <>
      <PageHeader
        eyebrow="NPA staging"
        title="Add & classify"
        desc="Register loan accounts, then run the deterministic IRACP engine — Standard, SMA-0/1/2, NPA — with misclassification flags against your existing staging."
        actions={
          <button
            onClick={handleClassify}
            disabled={classifying || loans.length === 0}
            className="btn-primary"
          >
            {classifying ? "Classifying…" : "Run classification"}
          </button>
        }
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
      {classifyMsg && (
        <div className="mb-4">
          <OkBox>{classifyMsg}</OkBox>
        </div>
      )}
      {mismatches.length > 0 && (
        <div className="mb-4">
          <ErrorBox>
            {mismatches.length} account(s) disagree with your existing
            classification — review the flagged rows below.
          </ErrorBox>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* add form */}
        <Card className="lg:col-span-1">
          <h2 className="font-display text-xl">New loan account</h2>
          <form onSubmit={handleAdd} className="mt-4 space-y-3">
            <div>
              <label className="label">Account number</label>
              <input
                name="account_no"
                value={form.account_no}
                onChange={handleChange}
                required
                className="input"
                placeholder="LN-0001"
              />
            </div>
            <div>
              <label className="label">Borrower name</label>
              <input
                name="borrower_name"
                value={form.borrower_name}
                onChange={handleChange}
                required
                className="input"
                placeholder="Acme Traders"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Account type</label>
                <select
                  name="account_type"
                  value={form.account_type}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="term_loan">Term loan</option>
                  <option value="revolving">Revolving / CC-OD</option>
                </select>
              </div>
              <div>
                <label className="label">Days past due</label>
                <input
                  name="days_past_due"
                  type="number"
                  min={0}
                  value={form.days_past_due}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Outstanding (₹)</label>
                <input
                  name="outstanding"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.outstanding}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="500000"
                />
              </div>
              <div>
                <label className="label">Existing staging</label>
                <select
                  name="existing_classification"
                  value={form.existing_classification}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Unknown</option>
                  <option value="Standard">Standard</option>
                  <option value="SMA-0">SMA-0</option>
                  <option value="SMA-1">SMA-1</option>
                  <option value="SMA-2">SMA-2</option>
                  <option value="NPA">NPA</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? "Adding…" : "Add account"}
            </button>
          </form>
        </Card>

        {/* table */}
        <Card className="lg:col-span-2">
          <h2 className="font-display mb-1 text-xl">Loan register</h2>
          <p className="mb-4 text-sm text-[#78716c]">
            <span className="mono">{loans.length}</span> accounts on record.
          </p>
          {loans.length === 0 ? (
            <EmptyState
              title="No accounts yet"
              desc="Add your first loan account to run the classification engine."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Borrower</th>
                    <th>DPD</th>
                    <th>Computed</th>
                    <th>Rule basis</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((l) => (
                    <tr key={l.id}>
                      <td className="mono whitespace-nowrap font-medium">
                        {l.account_no}
                      </td>
                      <td className="max-w-[160px] truncate">
                        {l.borrower_name}
                      </td>
                      <td className="mono">{l.days_past_due}</td>
                      <td>
                        {l.computed_classification ? (
                          <Pill value={l.computed_classification} />
                        ) : (
                          <span className="text-[#a8a29e]">—</span>
                        )}
                      </td>
                      <td className="max-w-[220px] truncate text-[#78716c]">
                        {l.rule_reason ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <p className="mono mt-6 text-xs text-[#a8a29e]">
        engine: deterministic IRACP · thresholds: 0 / 30 / 60 / 90 DPD (term),
        SMA-0/1/2 (revolving)
      </p>
    </>
  );
}
