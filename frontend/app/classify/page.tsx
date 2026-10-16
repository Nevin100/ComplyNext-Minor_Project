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
  account_id: string;
  borrower_name: string;
  account_type: string;
  days_past_due: number;
  outstanding_amount: number;
  existing_classification: string | null;
}

interface ClassResult {
  account_id: string;
  borrower_name: string;
  days_past_due: number;
  computed_classification: string;
  existing_classification: string | null;
  is_misclassified: boolean;
  rule_reference: string;
  reasoning: string;
}

const EMPTY_FORM = {
  account_id: "",
  borrower_name: "",
  account_type: "term_loan",
  days_past_due: "",
  outstanding_amount: "",
  existing_classification: "",
};

export default function ClassifyPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [results, setResults] = useState<ClassResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [classifying, setClassifying] = useState(false);

  const fetchLoans = async () => {
    try {
      const res = await api.get("/api/loan-accounts");
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
      await api.post("/api/loan-accounts", {
        account_id: form.account_id,
        borrower_name: form.borrower_name,
        account_type: form.account_type,
        days_past_due: Number(form.days_past_due),
        outstanding_amount: Number(form.outstanding_amount),
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
    setError("");
    setOk("");
    setClassifying(true);
    try {
      const res = await api.get("/api/classify");
      const list: ClassResult[] = res.data ?? [];
      setResults(list);
      const mism = list.filter((r) => r.is_misclassified).length;
      setOk(
        `${list.length} accounts classified · ${mism} misclassified against existing records.`
      );
    } catch {
      setError("Classification run failed.");
    } finally {
      setClassifying(false);
    }
  };

  if (loading) return <Spinner label="Loading loan accounts…" />;

  const mismatches = (results ?? []).filter((r) => r.is_misclassified);

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
              <label className="label">Account ID</label>
              <input
                name="account_id"
                value={form.account_id}
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
                  name="outstanding_amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.outstanding_amount}
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

        {/* register + results */}
        <div className="space-y-6 lg:col-span-2">
          {results && (
            <Card>
              <h2 className="font-display mb-1 text-xl">
                Latest classification run
              </h2>
              <p className="mb-4 text-sm text-[#78716c]">
                <span className="mono">{results.length}</span> accounts run
                through the IRACP engine.
              </p>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>DPD</th>
                      <th>Computed</th>
                      <th>Existing</th>
                      <th>Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.account_id}>
                        <td>
                          <p className="mono font-medium">{r.account_id}</p>
                          <p className="max-w-[140px] truncate text-xs text-[#78716c]">
                            {r.borrower_name}
                          </p>
                        </td>
                        <td className="mono">{r.days_past_due}</td>
                        <td>
                          <Pill value={r.computed_classification} />
                        </td>
                        <td className="text-[#78716c]">
                          {r.existing_classification ?? "—"}
                        </td>
                        <td>
                          {r.is_misclassified ? (
                            <Pill value="GAP" />
                          ) : (
                            <span className="text-xs text-[#a8a29e]">match</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {results.some((r) => r.reasoning) && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-[#78716c] hover:text-[#1c1917]">
                    Rule reasoning per account
                  </summary>
                  <div className="mt-3 space-y-2">
                    {results.map((r) => (
                      <p
                        key={r.account_id}
                        className="text-xs leading-relaxed text-[#78716c]"
                      >
                        <span className="mono font-medium text-[#1c1917]">
                          {r.account_id}
                        </span>{" "}
                        — {r.reasoning}
                      </p>
                    ))}
                  </div>
                </details>
              )}
            </Card>
          )}

          <Card>
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
                      <th>Type</th>
                      <th>DPD</th>
                      <th>Outstanding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((l) => (
                      <tr key={l.id}>
                        <td className="mono whitespace-nowrap font-medium">
                          {l.account_id}
                        </td>
                        <td className="max-w-[140px] truncate">
                          {l.borrower_name}
                        </td>
                        <td className="whitespace-nowrap text-[#78716c]">
                          {l.account_type === "term_loan"
                            ? "Term loan"
                            : "Revolving"}
                        </td>
                        <td className="mono">{l.days_past_due}</td>
                        <td className="mono">
                          ₹{Number(l.outstanding_amount).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      <p className="mono mt-6 text-xs text-[#a8a29e]">
        engine: deterministic IRACP · thresholds: 0 / 30 / 60 / 90 DPD (term),
        SMA-0/1/2 (revolving)
      </p>
    </>
  );
}
