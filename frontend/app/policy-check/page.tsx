/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getToken } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import {
  UploadCloud,
  FileSearch,
  FileText,
  Play,
  ExternalLink,
  Hash,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface PolicyDoc {
  id: number;
  filename: string;
  uploaded_at: string;
}

interface GapFinding {
  id: number;
  policy_clause: string;
  status: string;
  explanation: string;
  rbi_source_name?: string;
  rbi_source_url?: string;
  rbi_chunk_index?: number;
}

const statusBadgeStyles: Record<string, string> = {
  COMPLIANT: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  GAP: "bg-rose-50 text-rose-700 border-rose-200/80",
  OUTDATED: "bg-amber-50 text-amber-700 border-amber-200/80",
};

const statusIcons: Record<string, React.ReactNode> = {
  COMPLIANT: <ShieldCheck className="w-3.5 h-3.5" />,
  GAP: <ShieldAlert className="w-3.5 h-3.5" />,
  OUTDATED: <AlertTriangle className="w-3.5 h-3.5" />,
};

const API = process.env.NEXT_PUBLIC_API_URL;

export default function PolicyCheckPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [policies, setPolicies] = useState<PolicyDoc[]>([]);
  const [findings, setFindings] = useState<GapFinding[]>([]);
  const [activePolicy, setActivePolicy] = useState<PolicyDoc | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [summary, setSummary] = useState<{ total: number; gaps: number } | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPolicies = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await axios.get(`${API}/api/policies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolicies(res.data || []);
    } catch {
      /* silent on first load */
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthChecked(true);
    fetchPolicies();
  }, [router]);

  const handleUpload = async () => {
    const token = getToken();
    if (!token || !file) return;
    setUploading(true);
    setMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axios.post(`${API}/api/policies/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg({ type: "success", text: `"${file.name}" uploaded. Ab Analyze dabao.` });
      setFile(null);
      fetchPolicies();
    } catch (err: unknown) {
      const detail =
        axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
      setMsg({ type: "error", text: detail || "Upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (policy: PolicyDoc) => {
    const token = getToken();
    if (!token) return;
    setAnalyzing(true);
    setMsg(null);
    setActivePolicy(policy);
    try {
      const res = await axios.post(
        `${API}/api/policies/${policy.id}/analyze`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFindings(res.data.findings || []);
      setSummary({ total: res.data.total_clauses, gaps: res.data.gaps_found });
      setMsg({
        type: "success",
        text: `Analysis complete: ${res.data.gaps_found} gap(s) in ${res.data.total_clauses} clauses.`,
      });
    } catch (err: unknown) {
      const detail =
        axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
      setMsg({ type: "error", text: detail || "Analysis failed. GROQ_API_KEY check karo." });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleViewFindings = async (policy: PolicyDoc) => {
    const token = getToken();
    if (!token) return;
    setActivePolicy(policy);
    setSummary(null);
    try {
      const res = await axios.get(`${API}/api/policies/${policy.id}/findings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFindings(res.data || []);
    } catch {
      setMsg({ type: "error", text: "Could not load findings." });
    }
  };

  if (!authChecked) return null;

  const gapCount = findings.filter((f) => f.status !== "COMPLIANT").length;

  return (
    <AppLayout>
      <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
        {/* Subheader */}
        <div className="border-b border-slate-200/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-950 tracking-tight">
              Policy Gap Detection
            </h1>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/70 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" />
              LangGraph Multi-Agent
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload an internal policy document — retriever, comparer and explainer agents
            check every clause against RBI circulars with citations.
          </p>
        </div>

        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {msg && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                msg.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {msg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="font-medium">{msg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Upload card */}
            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
                <div className="h-7 w-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-none">
                    Upload Policy Document
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">.txt ya .pdf</p>
                </div>
              </div>

              <label className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-lg p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-purple-50/20">
                <FileText className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-700">
                  {file ? file.name : "Click to select policy file"}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Internal KYC / asset-classification policy
                </span>
                <input
                  type="file"
                  accept=".txt,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 rounded-md transition-all disabled:opacity-40"
              >
                {uploading ? "Uploading..." : "Upload Policy"}
              </button>
            </div>

            {/* Policies list */}
            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
                <div className="h-7 w-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                  <FileSearch className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-none">
                    Your Policies
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Run the 3-agent analysis on any uploaded document
                  </p>
                </div>
              </div>

              {policies.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">
                  Koi policy upload nahi hui abhi. Pehle left se upload karo.
                </p>
              ) : (
                <div className="space-y-2">
                  {policies.map((p) => (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition ${
                        activePolicy?.id === p.id
                          ? "border-purple-300 bg-purple-50/40"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {p.filename}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {new Date(p.uploaded_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleViewFindings(p)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-950 px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleAnalyze(p)}
                          disabled={analyzing}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded disabled:opacity-40"
                        >
                          <Play className="w-3 h-3" />
                          {analyzing && activePolicy?.id === p.id ? "Analyzing..." : "Analyze"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Findings */}
          {(findings.length > 0 || summary) && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Gap Analysis {activePolicy ? `— ${activePolicy.filename}` : ""}
                </h3>
                {summary && (
                  <span className="text-[11px] font-mono text-slate-500">
                    {summary.gaps} gap(s) / {summary.total} clauses
                  </span>
                )}
                {!summary && gapCount > 0 && (
                  <span className="text-[11px] font-mono text-slate-500">
                    {gapCount} gap(s) / {findings.length} clauses
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {findings.map((f) => (
                  <div key={f.id} className="rounded-lg border border-slate-200 p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded border ${
                          statusBadgeStyles[f.status] || "bg-slate-100"
                        }`}
                      >
                        {statusIcons[f.status]}
                        {f.status}
                      </span>
                      {f.rbi_source_name && (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/80">
                            <Hash className="w-3 h-3 text-slate-400" />
                            Chunk #{f.rbi_chunk_index}
                          </span>
                          {f.rbi_source_url && (
                            <a
                              href={f.rbi_source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/60 px-2.5 py-0.5 rounded border border-blue-200/50"
                            >
                              <span>Gazette Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Policy clause
                      </p>
                      <p className="text-xs text-slate-700 bg-slate-50/60 p-2.5 rounded border border-slate-150">
                        {f.policy_clause}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Agent explanation {f.rbi_source_name && `— ${f.rbi_source_name}`}
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed">{f.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
