/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getToken } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";

interface ClassificationResult {
  account_id: string;
  borrower_name: string;
  days_past_due: number;
  computed_classification: string;
  existing_classification: string;
  is_misclassified: boolean;
  reasoning: string;
}

const statusBadgeStyles: Record<string, string> = {
  Standard: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  "SMA-0": "bg-blue-50 text-blue-700 border-blue-200/80",
  "SMA-1": "bg-amber-50 text-amber-700 border-amber-200/80",
  "SMA-2": "bg-orange-50 text-orange-800 border-orange-200/80",
  NPA: "bg-rose-50 text-rose-700 border-rose-200/80",
  Substandard: "bg-rose-100 text-rose-800 border-rose-200",
  Doubtful: "bg-purple-50 text-purple-700 border-purple-200/80",
  Loss: "bg-slate-900 text-white border-slate-900",
};

export default function Dashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMismatch, setFilterMismatch] = useState(false);

  const fetchClassification = () => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthChecked(true);
    setLoading(true);
    setError("");

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/classify`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setResults(res.data))
      .catch((err) => {
        if (err?.response?.status === 401) {
          router.push("/login");
        } else {
          setError("Engine response failed. Unable to fetch asset staging data.");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClassification();
  }, [router]);

  const misclassifiedCount = useMemo(
    () => results.filter((r) => r.is_misclassified).length,
    [results]
  );
  const standardCount = useMemo(
    () => results.filter((r) => r.computed_classification === "Standard").length,
    [results]
  );
  const npaCount = useMemo(
    () =>
      results.filter((r) =>
        ["NPA", "Substandard", "Doubtful", "Loss"].includes(r.computed_classification)
      ).length,
    [results]
  );

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      const matchText =
        r.borrower_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.account_id.toLowerCase().includes(searchQuery.toLowerCase());
      return filterMismatch ? matchText && r.is_misclassified : matchText;
    });
  }, [results, searchQuery, filterMismatch]);

  if (!authChecked) return null;

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-white min-h-screen">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                Asset Classification Engine
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                IRACP Engine Live
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Multi-tenant asset classification, DPD staging, and core-banking synchronization logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchClassification}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
              <span>Re-run Evaluation</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Evaluated</span>
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-3xl font-extrabold text-slate-950 mt-2">
              {loading ? "..." : results.length}
            </p>
            <span className="text-xs text-slate-500 mt-1 block">Active loan accounts</span>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between text-rose-600">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Classification Mismatch</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-3xl font-extrabold text-rose-600 mt-2">
              {loading ? "..." : misclassifiedCount}
            </p>
            <span className="text-xs text-rose-600/90 mt-1 block font-medium">
              {misclassifiedCount > 0 ? "Requires CBS alignment" : "Zero provisioning drift"}
            </span>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Standard Portfolio</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-950 mt-2">
              {loading ? "..." : standardCount}
            </p>
            <span className="text-xs text-emerald-700 mt-1 block font-medium">Performing books (DPD 0)</span>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Stressed / NPA</span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-950 mt-2">
              {loading ? "..." : npaCount}
            </p>
            <span className="text-xs text-amber-700 mt-1 block font-medium">Substandard, Doubtful & Loss</span>
          </div>
        </div>

        {/* Data Container */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by borrower name or account ID..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterMismatch(!filterMismatch)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  filterMismatch
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Show Mismatches ({misclassifiedCount})</span>
              </button>
            </div>
          </div>

          {/* Table / Empty / Loading State */}
          {loading ? (
            <div className="py-24 text-center">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Evaluating loan books against RBI norms...</p>
              <p className="text-xs text-slate-400 mt-1">Connecting to FastAPI engine</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-rose-600">{error}</p>
              <button
                onClick={fetchClassification}
                className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
              >
                Try refreshing
              </button>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <p className="text-sm font-semibold text-slate-700">No matching accounts found.</p>
              <p className="text-xs text-slate-400 mt-1">Check your search query or reset mismatch filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Account ID</th>
                    <th className="py-3.5 px-4">Borrower Name</th>
                    <th className="py-3.5 px-4 text-center">DPD</th>
                    <th className="py-3.5 px-4">Computed (Engine)</th>
                    <th className="py-3.5 px-4">Existing (CBS)</th>
                    <th className="py-3.5 px-4 text-center">Audit Status</th>
                    <th className="py-3.5 px-4">Regulatory Reasoning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredResults.map((r) => {
                    const badgeClass =
                      statusBadgeStyles[r.computed_classification] ||
                      "bg-slate-100 text-slate-800 border-slate-200";

                    return (
                      <tr
                        key={r.account_id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          r.is_misclassified ? "bg-rose-50/20" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-900">
                          {r.account_id}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          {r.borrower_name}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block font-mono font-semibold px-2 py-0.5 rounded text-xs ${
                              r.days_past_due > 90
                                ? "bg-rose-100 text-rose-800"
                                : r.days_past_due > 0
                                ? "bg-amber-100 text-amber-800"
                                : "text-slate-600 bg-slate-100"
                            }`}
                          >
                            {r.days_past_due}d
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${badgeClass}`}
                          >
                            {r.computed_classification}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {r.existing_classification}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {r.is_misclassified ? (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 text-[11px]">
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              Mismatch
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Aligned
                            </span>
                          )}
                        </td>
                        <td
                          className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate"
                          title={r.reasoning}
                        >
                          {r.reasoning || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Metrics */}
          {!loading && !error && filteredResults.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
              <span>
                Showing <strong>{filteredResults.length}</strong> of <strong>{results.length}</strong> loan accounts
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                Rule Engine: IRACP Standard Specification (RBI/2023-24/124)
              </span>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}