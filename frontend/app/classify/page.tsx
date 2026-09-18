/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getToken } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import {
  FilePlus2,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Info,
  Download,
  Building,
  Hash,
  Calendar,
} from "lucide-react";

interface EvaluatedLoan {
  account_id: string;
  borrower_name: string;
  days_past_due: number;
  computed_classification: string;
  existing_classification: string;
  is_misclassified: boolean;
  rule_reference: string;
  reasoning: string;
}

const statusBadgeStyles: Record<string, string> = {
  Standard: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  "SMA-0": "bg-blue-50 text-blue-700 border-blue-200/80",
  "SMA-1": "bg-amber-50 text-amber-700 border-amber-200/80",
  "SMA-2": "bg-orange-50 text-orange-800 border-orange-200/80",
  NPA: "bg-rose-50 text-rose-700 border-rose-200/80",
  Substandard: "bg-rose-100 text-rose-800 border-rose-300",
  Doubtful: "bg-purple-50 text-purple-700 border-purple-200/80",
  Loss: "bg-slate-900 text-white border-slate-900",
};

export default function ClassifyPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  // Single Loan Form
  const [form, setForm] = useState({
    account_id: "",
    borrower_name: "",
    account_type: "term_loan", // NEW
    days_past_due: "",
    outstanding_amount: "", // NEW
    existing_classification: "Standard",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Bulk Upload State
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [bulkMsg, setBulkMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Recent Evaluation Receipt
  const [latestEvaluation, setLatestEvaluation] =
    useState<EvaluatedLoan | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthChecked(true);
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSubmitting(true);
    setFormMsg(null);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/loan-accounts`,
        {
          ...form,
          days_past_due: Number(form.days_past_due),
          outstanding_amount: Number(form.outstanding_amount), // ensure it's a number, not a string
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Agar backend immediately classified output bhejta hai
      if (res.data?.computed_classification) {
        setLatestEvaluation(res.data);
      }

      setFormMsg({
        type: "success",
        text: `Account ${form.account_id} added & evaluated under tenant isolation.`,
      });
      setForm({
        account_id: "",
        borrower_name: "",
        account_type: "term_loan",
        days_past_due: "",
        outstanding_amount: "",
        existing_classification: "Standard",
      });
    } catch (err: any) {
      setFormMsg({
        type: "error",
        text:
          err?.response?.data?.detail ||
          "Failed to commit loan account to ledger.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
  const token = getToken();

  if (!token || !file) return;

  setUploading(true);
  setBulkMsg(null);

  try {
    const text = await file.text();

    const rows = text
      .trim()
      .split("\n")
      .map((row) => row.trim())
      .filter(Boolean);

    if (rows.length < 2) {
      throw new Error("CSV file must contain a header and at least one record.");
    }

    const headers = rows[0]
      .split(",")
      .map((header) => header.trim());

    const records = rows.slice(1).map((row) => {
      const values = row
        .split(",")
        .map((value) => value.trim());

      const record: Record<string, string> = {};

      headers.forEach((header, index) => {
        record[header] = values[index] ?? "";
      });

      return {
        account_id: record.account_id,
        borrower_name: record.borrower_name,
        account_type: record.account_type || "term_loan",
        days_past_due: Number(record.days_past_due),
        outstanding_amount: Number(record.outstanding_amount),
        existing_classification:
          record.existing_classification || null,
      };
    });

    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/loan-accounts/bulk`,
      records,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setBulkMsg({
      type: "success",
      text: `Batch file "${file.name}" processed successfully. ${records.length} accounts added.`,
    });

    setFile(null);
  } catch (err: unknown) {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.detail
      : err instanceof Error
        ? err.message
        : undefined;

    setBulkMsg({
      type: "error",
      text:
        message ||
        "Batch parsing failed. Validate column headers.",
    });
  } finally {
    setUploading(false);
  }
};

  const handleSampleCSVDownload = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "account_id,borrower_name,days_past_due,existing_classification\n" +
      "LN101,Global Auto Spares,75,SMA-1\n" +
      "LN102,Krishna Dairy Farm,95,SMA-2\n" +
      "LN103,Apex Logistics Ltd,0,Standard";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "complynext_loan_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!authChecked) return null;

  return (
    <AppLayout>
      <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
        {/* Subheader Strip */}
        <div className="border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-950 tracking-tight">
                Add & Classify Loan Exposures
              </h1>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                Multi-Tenant Isolated
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit asset records for deterministic IRACP DPD staging &
              circular evaluation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition shadow-2xs"
            >
              <span>View Ledger</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Informational Sub-Strip */}
        <div className="px-6 py-2.5 bg-slate-50/60 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Records committed here are isolated exclusively to your registered
              company JWT.
            </span>
          </div>
          <button
            onClick={handleSampleCSVDownload}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
          >
            <Download className="w-3 h-3" />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Content Container */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Col: Single Entry Form (7 cols) */}
            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <FilePlus2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-none">
                      Single Account Ingestion
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Commit real-time loan record
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Step 1 of 1
                </span>
              </div>

              {formMsg && (
                <div
                  className={`mb-5 p-3 rounded-lg text-xs flex items-start gap-2 border ${
                    formMsg.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  {formMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="font-medium">{formMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Account ID */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Account ID
                    </label>
                    <div className="relative">
                      <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="account_id"
                        placeholder="e.g. LN101"
                        value={form.account_id}
                        onChange={handleChange}
                        required
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 font-mono text-slate-900 transition"
                      />
                    </div>
                  </div>

                  {/* Days Past Due */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Days Past Due (DPD)
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        name="days_past_due"
                        placeholder="0"
                        min={0}
                        value={form.days_past_due}
                        onChange={handleChange}
                        required
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 font-mono text-slate-900 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Borrower Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Borrower / Legal Entity Name
                  </label>
                  <input
                    type="text"
                    name="borrower_name"
                    placeholder="e.g. Global Auto Spares"
                    value={form.borrower_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 text-slate-900 transition font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Account Type */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Account Type
                    </label>
                    <select
                      name="account_type"
                      value={form.account_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 text-slate-900 font-medium transition"
                    >
                      <option value="term_loan">Term Loan</option>
                      <option value="revolving">
                        Revolving (Cash Credit / OD)
                      </option>
                    </select>
                  </div>

                  {/* Outstanding Amount */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Outstanding Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="outstanding_amount"
                      placeholder="e.g. 250000"
                      min={0}
                      value={form.outstanding_amount}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 font-mono text-slate-900 transition"
                    />
                  </div>
                </div>

                {/* Existing CBS Classification */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Existing Core-Banking (CBS) Staging
                  </label>
                  <select
                    name="existing_classification"
                    value={form.existing_classification}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 text-slate-900 font-medium transition"
                  >
                    <option value="Standard">Standard (DPD 0)</option>
                    <option value="SMA-0">SMA-0 (DPD 1 - 30)</option>
                    <option value="SMA-1">SMA-1 (DPD 31 - 60)</option>
                    <option value="SMA-2">SMA-2 (DPD 61 - 90)</option>
                    <option value="NPA">NPA (DPD &gt; 90)</option>
                    <option value="Substandard">Substandard</option>
                    <option value="Doubtful">Doubtful</option>
                    <option value="Loss">Loss Asset</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Committing to IRACP Engine...</span>
                      </>
                    ) : (
                      <>
                        <span>Add & Run Classification</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Col: Bulk Upload & Schema Info (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Bulk Upload Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
                  <div className="h-7 w-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-none">
                      Bulk Batch Upload
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Multipart CSV file parsing
                    </p>
                  </div>
                </div>

                {bulkMsg && (
                  <div
                    className={`mb-4 p-3 rounded-lg text-xs flex items-start gap-2 border ${
                      bulkMsg.type === "success"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-rose-50 border-rose-200 text-rose-800"
                    }`}
                  >
                    {bulkMsg.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span className="font-medium">{bulkMsg.text}</span>
                  </div>
                )}

                {/* Dropzone container */}
                <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-lg p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20">
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-700">
                    {file ? file.name : "Click or drag CSV file to ingest"}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Standard tabular format with header rows
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>

                {file && (
                  <div className="mt-3 flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-mono text-slate-700 truncate max-w-xs">
                      {file.name}
                    </span>
                    <button
                      onClick={() => setFile(null)}
                      className="text-rose-600 hover:underline text-[11px] font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                )}

                <button
                  onClick={handleFileUpload}
                  disabled={!file || uploading}
                  className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 rounded-md transition-all disabled:opacity-40 shadow-xs"
                >
                  {uploading
                    ? "Ingesting Portfolio Batch..."
                    : "Upload & Parse Portfolio"}
                </button>
              </div>

              {/* Schema Specification Box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-2">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Required CSV Column Headers</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Files must contain the exact column names below:
                </p>
                <div className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200 text-slate-700 select-all">
                  account_id,borrower_name,days_past_due,existing_classification
                </div>
              </div>
            </div>
          </div>

          {/* Latest Live Evaluation Output (if available) */}
          {latestEvaluation && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Immediate Engine Classification Output
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Ref: {latestEvaluation.account_id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    Computed Staging
                  </span>
                  <span
                    className={`inline-block mt-1 font-semibold px-2 py-0.5 rounded border ${
                      statusBadgeStyles[
                        latestEvaluation.computed_classification
                      ] || "bg-slate-100"
                    }`}
                  >
                    {latestEvaluation.computed_classification}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">
                    Audit Result
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 font-bold">
                    {latestEvaluation.is_misclassified ? (
                      <span className="text-rose-600 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Mismatch
                        Detected
                      </span>
                    ) : (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aligned with
                        CBS
                      </span>
                    )}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">
                    Regulatory Rationale
                  </span>
                  <p className="mt-1 text-slate-700 font-medium text-[11px]">
                    {latestEvaluation.reasoning}
                  </p>
                  {latestEvaluation.rule_reference && (
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      {latestEvaluation.rule_reference}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
