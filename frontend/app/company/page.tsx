/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getToken, logout } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  Search,
  X,
  Save,
  RefreshCw,
} from "lucide-react";

interface Company {
  id: number;
  name: string;
  created_at: string | null;
  total_users: number;
  total_loan_accounts: number;
}

interface RawLoanAccount {
  id: number;
  account_id: string;
  borrower_name: string;
  account_type: string;
  days_past_due: number;
  outstanding_amount: number;
  existing_classification: string;
}

export default function CompanyPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [loans, setLoans] = useState<RawLoanAccount[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);
  const [companyMsg, setCompanyMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmDeleteCompany, setConfirmDeleteCompany] = useState(false);

  // Loan Search & Filter
  const [loanSearch, setLoanSearch] = useState("");

  // Edit Loan Modal / Drawer state
  const [editingLoan, setEditingLoan] = useState<RawLoanAccount | null>(null);
  const [updatingLoan, setUpdatingLoan] = useState(false);
  const [loanActionError, setLoanActionError] = useState("");

  const fetchAllData = async (token: string) => {
    setLoading(true);
    setCompanyMsg(null);
    try {
      const [companyRes, loansRes] = await Promise.all([
        axios.get<Company>(`${process.env.NEXT_PUBLIC_API_URL}/api/company/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get<RawLoanAccount[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/loan-accounts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setCompany(companyRes.data);
      setCompanyName(companyRes.data.name || "");
      setLoans(loansRes.data || []);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        router.push("/login");
      } else {
        setCompanyMsg({ type: "error", text: "Failed to load company profile & loan ledgers." });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthChecked(true);
    fetchAllData(token);
  }, [router]);

  // Update Company Name
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSavingCompany(true);
    setCompanyMsg(null);
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/company/me`,
        { name: companyName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompany(res.data);
      setCompanyMsg({ type: "success", text: "Organization legal name updated." });
    } catch (err: any) {
      setCompanyMsg({
        type: "error",
        text: err?.response?.data?.detail || "Failed to update company name.",
      });
    } finally {
      setSavingCompany(false);
    }
  };

  // Delete Company
  const handleDeleteCompany = async () => {
    const token = getToken();
    if (!token) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/company/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
    } catch {
      setCompanyMsg({ type: "error", text: "Failed to delete company workspace." });
    }
  };

  // Delete Single Loan Account
  const handleDeleteLoan = async (loanDbId: number) => {
    const token = getToken();
    if (!token) return;
    const confirm = window.confirm("Delete this loan account from your ledger permanently?");
    if (!confirm) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/loan-accounts/${loanDbId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoans((prev) => prev.filter((l) => l.id !== loanDbId));
      if (company) {
        setCompany({ ...company, total_loan_accounts: Math.max(0, company.total_loan_accounts - 1) });
      }
    } catch (err: any) {
      setLoanActionError(err?.response?.data?.detail || "Failed to delete loan account.");
    }
  };

  // Update Single Loan Account
  const handleUpdateLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoan) return;
    const token = getToken();
    if (!token) return;

    setUpdatingLoan(true);
    setLoanActionError("");
    try {
      const { id, account_id, ...updatePayload } = editingLoan;
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/loan-accounts/${id}`,
        {
          borrower_name: updatePayload.borrower_name,
          account_type: updatePayload.account_type,
          days_past_due: Number(updatePayload.days_past_due),
          outstanding_amount: Number(updatePayload.outstanding_amount),
          existing_classification: updatePayload.existing_classification,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLoans((prev) => prev.map((item) => (item.id === id ? res.data : item)));
      setEditingLoan(null);
    } catch (err: any) {
      setLoanActionError(err?.response?.data?.detail || "Failed to update loan details.");
    } finally {
      setUpdatingLoan(false);
    }
  };

  // Total Outstanding Capital sum
  const totalPortfolioExposure = useMemo(() => {
    return loans.reduce((acc, curr) => acc + (Number(curr.outstanding_amount) || 0), 0);
  }, [loans]);

  // Filtered Loans
  const filteredLoans = useMemo(() => {
    const q = loanSearch.toLowerCase();
    return loans.filter(
      (l) =>
        l.account_id?.toLowerCase().includes(q) ||
        l.borrower_name?.toLowerCase().includes(q) ||
        l.account_type?.toLowerCase().includes(q)
    );
  }, [loans, loanSearch]);

  if (!authChecked) return null;

  return (
    <AppLayout>
      <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
        
        {/* Header Strip */}
        <div className="border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-950 tracking-tight">
                Entity Profile & Loan Ledgers
              </h1>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/80">
                Tenant ID: #{company?.id || "—"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage corporate structure, authorized users, and underlying loan assets.
            </p>
          </div>

          <button
            onClick={() => {
              const token = getToken();
              if (token) fetchAllData(token);
            }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            <span>Sync Ledger</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-slate-200/80 divide-x divide-slate-100">
          <div className="px-6 py-3.5">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Registered Entity</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-bold tracking-tight text-slate-900 truncate">
                {loading ? "..." : company?.name}
              </span>
            </div>
          </div>

          <div className="px-6 py-3.5">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Capital Exposure</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold tracking-tight text-slate-900 font-mono">
                ₹{totalPortfolioExposure.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="px-6 py-3.5">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Managed Accounts</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold tracking-tight text-blue-600 font-mono">
                {loading ? "—" : company?.total_loan_accounts}
              </span>
              <span className="text-[10px] text-slate-400">Ledger records</span>
            </div>
          </div>

          <div className="px-6 py-3.5">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Officer Seats</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold tracking-tight text-slate-900 font-mono">
                {loading ? "—" : company?.total_users}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Authorized</span>
            </div>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-8">
          
          {/* Top Section: Company Settings & Danger Zone */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Entity Renaming Form */}
            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Corporate Entity Information
                  </h2>
                </div>
                {company?.created_at && (
                  <span className="text-[10px] font-mono text-slate-400">
                    Est: {new Date(company.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              {companyMsg && (
                <div
                  className={`mb-4 p-3 rounded-lg text-xs flex items-start gap-2 border ${
                    companyMsg.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  {companyMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="font-medium">{companyMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveCompany} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Registered Financial Institution Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder="e.g. Test Cooperation Bank"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 font-medium text-slate-900 transition"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={savingCompany || companyName === company?.name}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-semibold shadow-2xs transition disabled:opacity-40"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingCompany ? "Saving Changes..." : "Update Entity Name"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="lg:col-span-5 rounded-xl border border-rose-200/80 bg-rose-50/20 p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-rose-100 mb-3 text-rose-700">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Tenant Disconnection</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Deleting this company workspace will instantly purge all isolated loan records, user memberships, and historical IRACP audit logs.
              </p>

              {!confirmDeleteCompany ? (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteCompany(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 rounded-md transition shadow-2xs"
                >
                  Delete Company Account
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteCompany}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition shadow-xs"
                  >
                    Confirm Permanent Purge
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteCompany(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Bottom Section: Active Loan Accounts Ledger Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            
            {/* Table Control Header */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-950">
                  Loan Accounts Ledger
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Raw loan records registered under this tenant via CSV upload or API.
                </p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={loanSearch}
                  onChange={(e) => setLoanSearch(e.target.value)}
                  placeholder="Filter by account, borrower, type..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400 transition"
                />
              </div>
            </div>

            {loanActionError && (
              <div className="m-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                <span>{loanActionError}</span>
                <button onClick={() => setLoanActionError("")} className="text-rose-500 hover:text-rose-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Table Area */}
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-400">
                <RefreshCw className="w-5 h-5 text-slate-400 animate-spin mx-auto mb-2" />
                <span>Loading tenant loan books...</span>
              </div>
            ) : filteredLoans.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                No loan records found under this organization. Use &apos;Add Loans&apos; to register new portfolios.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                      <th className="py-2.5 px-4 font-medium">Account ID</th>
                      <th className="py-2.5 px-4 font-medium">Borrower Entity</th>
                      <th className="py-2.5 px-4 font-medium">Facility Type</th>
                      <th className="py-2.5 px-4 font-medium text-right">Outstanding (₹)</th>
                      <th className="py-2.5 px-4 font-medium text-center">DPD</th>
                      <th className="py-2.5 px-4 font-medium">CBS Staging</th>
                      <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {filteredLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-slate-50/75 transition-colors group">
                        {/* Account ID */}
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                          {loan.account_id}
                        </td>

                        {/* Borrower */}
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {loan.borrower_name}
                        </td>

                        {/* Account Type */}
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60">
                            {loan.account_type || "term_loan"}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                          ₹{Number(loan.outstanding_amount || 0).toLocaleString("en-IN")}
                        </td>

                        {/* DPD */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                              loan.days_past_due > 90
                                ? "bg-rose-100 text-rose-800"
                                : loan.days_past_due > 0
                                ? "bg-amber-100 text-amber-800"
                                : "text-slate-500 bg-slate-100"
                            }`}
                          >
                            {loan.days_past_due}d
                          </span>
                        </td>

                        {/* Classification */}
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {loan.existing_classification}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setEditingLoan(loan)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Edit record"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLoan(loan.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Footer */}
            {!loading && filteredLoans.length > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-200/80 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Showing <strong className="text-slate-700">{filteredLoans.length}</strong> of {loans.length} accounts
                </span>
                <span className="font-mono">
                  Multi-tenant Isolation: Strict Company Scope
                </span>
              </div>
            )}

          </div>

        </div>

        {/* Modal: Edit Loan Details (PUT /api/loan-accounts/{account_db_id}) */}
        {editingLoan && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">
                    Edit Loan: {editingLoan.account_id}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Update core banking exposure details</p>
                </div>
                <button
                  onClick={() => setEditingLoan(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loanActionError && (
                <div className="mb-4 p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {loanActionError}
                </div>
              )}

              <form onSubmit={handleUpdateLoanSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Borrower Name
                  </label>
                  <input
                    type="text"
                    value={editingLoan.borrower_name}
                    onChange={(e) =>
                      setEditingLoan({ ...editingLoan, borrower_name: e.target.value })
                    }
                    required
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 font-medium text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Account Type
                    </label>
                    <select
                      value={editingLoan.account_type}
                      onChange={(e) =>
                        setEditingLoan({ ...editingLoan, account_type: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 font-medium text-slate-900"
                    >
                      <option value="term_loan">Term Loan</option>
                      <option value="revolving">Revolving / CC / OD</option>
                      <option value="working_capital">Working Capital</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Days Past Due (DPD)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingLoan.days_past_due}
                      onChange={(e) =>
                        setEditingLoan({ ...editingLoan, days_past_due: Number(e.target.value) })
                      }
                      required
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Outstanding Principal (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingLoan.outstanding_amount}
                    onChange={(e) =>
                      setEditingLoan({
                        ...editingLoan,
                        outstanding_amount: Number(e.target.value),
                      })
                    }
                    required
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Existing Core Classification
                  </label>
                  <select
                    value={editingLoan.existing_classification}
                    onChange={(e) =>
                      setEditingLoan({
                        ...editingLoan,
                        existing_classification: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 font-medium text-slate-900"
                  >
                    <option value="Standard">Standard</option>
                    <option value="SMA-0">SMA-0</option>
                    <option value="SMA-1">SMA-1</option>
                    <option value="SMA-2">SMA-2</option>
                    <option value="NPA">NPA</option>
                    <option value="Substandard">Substandard</option>
                    <option value="Doubtful">Doubtful</option>
                    <option value="Loss">Loss</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingLoan(null)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingLoan}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-2xs transition disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{updatingLoan ? "Saving..." : "Commit Update"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}