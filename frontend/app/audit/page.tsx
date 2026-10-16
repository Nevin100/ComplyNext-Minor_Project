/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getToken } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import {
  ScrollText,
  Download,
  FileCheck2,
  FileSearch,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface AuditLog {
  id: number;
  action_type: string;
  input_ref?: string;
  result_summary: string;
  rule_reference?: string;
  citation_url?: string;
  created_at: string;
}

const actionBadgeStyles: Record<string, string> = {
  classification: "bg-blue-50 text-blue-700 border-blue-200/80",
  gap_analysis: "bg-purple-50 text-purple-700 border-purple-200/80",
  scrape: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
};

const actionIcons: Record<string, React.ReactNode> = {
  classification: <FileCheck2 className="w-3.5 h-3.5" />,
  gap_analysis: <FileSearch className="w-3.5 h-3.5" />,
  scrape: <RefreshCw className="w-3.5 h-3.5" />,
};

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AuditPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/audit`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data || []);
    } catch {
      setError("Audit trail load nahi ho paya.");
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
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleDownload = async () => {
    const token = getToken();
    if (!token) return;
    setDownloading(true);
    try {
      const res = await axios.get(`${API}/api/audit/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "complynext_audit_report.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setError("PDF export failed.");
    } finally {
      setDownloading(false);
    }
  };

  if (!authChecked) return null;

  return (
    <AppLayout>
      <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
        {/* Subheader */}
        <div className="border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-950 tracking-tight">
                Explainable Audit Trail
              </h1>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/70 flex items-center gap-1">
                <ScrollText className="w-3 h-3 text-slate-500" />
                Timestamped
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Har system decision ka traceable record — citation aur rule reference ke saath.
            </p>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading || logs.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? "Generating PDF..." : "Download PDF Report"}
          </button>
        </div>

        <div className="p-6 max-w-7xl w-full mx-auto">
          {error && (
            <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-24 text-center">
              <span className="w-6 h-6 border-2 border-slate-400/30 border-t-slate-600 rounded-full animate-spin inline-block mb-3" />
              <p className="text-xs font-semibold text-slate-700">Loading audit trail...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-400">
              <ScrollText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 text-sm">Abhi koi audit entries nahi</p>
              <p className="text-slate-400 mt-1">
                Dashboard pe classify chalao ya Policy Gap Check me analyze karo — har decision yahan log hoga.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-left">
                      <th className="px-4 py-2.5 font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                        Timestamp
                      </th>
                      <th className="px-4 py-2.5 font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                        Action
                      </th>
                      <th className="px-4 py-2.5 font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                        Input
                      </th>
                      <th className="px-4 py-2.5 font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                        Result
                      </th>
                      <th className="px-4 py-2.5 font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded border ${
                              actionBadgeStyles[log.action_type] || "bg-slate-100"
                            }`}
                          >
                            {actionIcons[log.action_type]}
                            {log.action_type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 max-w-[160px] truncate" title={log.input_ref}>
                          {log.input_ref || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-slate-700">{log.result_summary}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500 max-w-[180px] truncate" title={log.rule_reference}>
                          {log.rule_reference || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
