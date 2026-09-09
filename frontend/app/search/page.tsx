/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getToken } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import {
  Search,
  FileText,
  ExternalLink,
  Sparkles,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Hash,
  Compass,
} from "lucide-react";

interface SearchResult {
  source_name: string;
  source_url: string;
  chunk_index: number;
  text: string;
}

const exampleQueries = [
  "What is the NPA classification period for agricultural loans?",
  "IRACP norms provisioning requirements for doubtful assets",
  "SMA-0, SMA-1 and SMA-2 DPD thresholds",
  "Restructuring guidelines for MSME exposures",
];

export default function SearchPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthChecked(true);
  }, [router]);

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const res = await axios.get<SearchResult[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/search-circulars`,
        {
          params: { query: searchQuery.trim() },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResults(res.data || []);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Semantic retrieval failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  if (!authChecked) return null;

  return (
    <AppLayout>
      <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
        
        {/* Sub-Header Strip */}
        <div className="border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-950 tracking-tight">
                RBI Semantic Circular Search
              </h1>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/70 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                RAG Retrieval Corpus
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Query parsed Master Directions and circular chunks with exact clause-level citations.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Shared Regulatory Enclave</span>
          </div>
        </div>

        {/* Search Input Hero */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/40">
          <div className="max-w-4xl mx-auto space-y-3">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about RBI directives, DPD norms, provisioning slabs..."
                className="w-full pl-11 pr-28 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Query</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Suggestions */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3 h-3" /> Quick Prompts:
              </span>
              {exampleQueries.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setQuery(ex);
                    executeSearch(ex);
                  }}
                  className="text-[11px] font-medium text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50/60 border border-slate-200/80 px-2.5 py-1 rounded-md transition shadow-2xs"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-4xl mx-auto w-full p-4 mt-4">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Results Area */}
        <div className="flex-1 max-w-4xl mx-auto w-full p-6">
          {loading ? (
            <div className="py-24 text-center">
              <span className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
              <p className="text-xs font-semibold text-slate-700">
                Traversing Vectorized RBI Circular Chunks...
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Executing semantic similarity match
              </p>
            </div>
          ) : searched && results.length === 0 && !error ? (
            <div className="py-20 text-center text-xs text-slate-400">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 text-sm">No matching circular chunks found</p>
              <p className="text-slate-400 mt-1">
                Try phrasing with standard regulatory terms (e.g., &quot;IRACP&quot;, &quot;NPA&quot;, &quot;Provisioning&quot;).
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs text-slate-500">
                <span>
                  Retrieved <strong>{results.length}</strong> semantically relevant circular citations
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  Shared Regulatory Corpus
                </span>
              </div>

              {results.map((r, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
                >
                  {/* Top Metadata Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span
                        className="font-bold text-xs sm:text-sm text-slate-900 truncate"
                        title={r.source_name}
                      >
                        {r.source_name || "RBI Master Circular / Directive"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Chunk index pill */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/80">
                        <Hash className="w-3 h-3 text-slate-400" />
                        Chunk #{r.chunk_index}
                      </span>

                      {/* Source Link */}
                      {r.source_url && (
                        <a
                          href={r.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/60 hover:bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200/50 transition"
                        >
                          <span>Gazette Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Chunk Text Body */}
                  <div className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap bg-slate-50/50 p-3.5 rounded-lg border border-slate-150">
                    {r.text}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              <Sparkles className="w-7 h-7 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 text-sm">Semantic Knowledge Base Ready</p>
              <p className="text-slate-400 mt-1 max-w-sm mx-auto">
                Type a natural language question or select a prompt above to extract relevant regulatory clauses.
              </p>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}