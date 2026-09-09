/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getToken } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import {
  FileText,
  Search,
  ExternalLink,
  DownloadCloud,
  Layers,
  AlertCircle,
  Database,
  Clock,
  RefreshCw,
} from "lucide-react";

interface CircularDocument {
  source_name: string;
  source_url: string;
  total_chunks: number;
  scraped_at: string;
}

export default function CircularsPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [circulars, setCirculars] = useState<CircularDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCirculars = (token: string) => {
    setLoading(true);
    axios
      .get<CircularDocument[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/circulars`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCirculars(res.data || []);
      })
      .catch((err) => {
        if (err?.response?.status === 401) router.push("/login");
        else setError("Failed to synchronize circular documents from regulatory database.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthChecked(true);
    fetchCirculars(token);
  }, [router]);

  const handleScrape = async () => {
    const token = getToken();
    if (!token) return;
    setScraping(true);
    setError("");
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/circulars/scrape`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCirculars(token);
    } catch {
      setError("Scrape execution failed. Verify target endpoint connectivity.");
    } finally {
      setScraping(false);
    }
  };

  // Aggregate stats based on exact API schema
  const totalChunksCount = useMemo(() => {
    return circulars.reduce((acc, curr) => acc + (curr.total_chunks || 0), 0);
  }, [circulars]);

  // Fast client-side search by source_name or source_url
  const filteredCirculars = useMemo(() => {
    return circulars.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.source_name?.toLowerCase().includes(query) ||
        item.source_url?.toLowerCase().includes(query)
      );
    });
  }, [circulars, searchQuery]);

  if (!authChecked) return null;

  return (
    <AppLayout>
      <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
        
        {/* Header Strip */}
        <div className="border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-950 tracking-tight">
                RBI Regulatory Repository
              </h1>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/70">
                Vector Indexed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Parsed Master Directions, circular document sources & chunked embeddings.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleScrape}
              disabled={scraping || loading}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-md transition-all disabled:opacity-50 shadow-xs"
            >
              <DownloadCloud className={`w-3.5 h-3.5 ${scraping ? "animate-bounce" : ""}`} />
              <span>{scraping ? "Ingesting Documents..." : "Run New Scrape"}</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200/80 divide-x divide-slate-100">
          <div className="px-6 py-3.5">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Source Documents
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold tracking-tight text-slate-900 font-mono">
                {loading ? "—" : circulars.length}
              </span>
              <span className="text-[10px] text-slate-400">Unique files</span>
            </div>
          </div>

          <div className="px-6 py-3.5">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Total Chunks
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold tracking-tight text-blue-600 font-mono">
                {loading ? "—" : totalChunksCount.toLocaleString()}
              </span>
              <span className="text-[10px] text-blue-500 font-medium">Embeddings</span>
            </div>
          </div>

          <div className="px-6 py-3.5">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Avg Chunks / Doc
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold tracking-tight text-slate-900 font-mono">
                {loading || circulars.length === 0
                  ? "—"
                  : Math.round(totalChunksCount / circulars.length)}
              </span>
              <span className="text-[10px] text-slate-400">Density</span>
            </div>
          </div>

          <div className="px-6 py-3.5">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Index Health
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Synchronized
              </span>
            </div>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="px-6 py-2.5 bg-slate-50/50 border-b border-slate-200/80 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by source name or URL..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400 transition"
            />
          </div>

          <span className="text-[11px] text-slate-400 font-mono self-center sm:self-auto">
            Grouped by source_name • 1 record per document
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-6 flex items-start gap-2.5 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Dense Table Layout */}
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="py-24 text-center">
              <RefreshCw className="w-5 h-5 text-slate-400 animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                Fetching chunked regulatory circulars...
              </p>
            </div>
          ) : filteredCirculars.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-400">
              <Database className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 text-sm">No circular sources available</p>
              <p className="text-slate-400 mt-1">
                {circulars.length === 0
                  ? "Click 'Run New Scrape' to fetch and vectorize circulars from RBI portal."
                  : "No sources matched your search filter."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-white">
                  <th className="py-3 px-6 font-medium">Source Document Name</th>
                  <th className="py-3 px-6 font-medium text-center">Indexed Chunks</th>
                  <th className="py-3 px-6 font-medium">Earliest Scraped At</th>
                  <th className="py-3 px-6 font-medium text-right">Source Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCirculars.map((item, idx) => (
                  <tr
                    key={`${item.source_name}-${idx}`}
                    className="hover:bg-slate-50/75 transition-colors group"
                  >
                    {/* Source Name */}
                    <td className="py-3.5 px-6 max-w-md">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-blue-600 transition-colors" />
                        <span
                          className="font-medium text-slate-900 truncate"
                          title={item.source_name}
                        >
                          {item.source_name || "Untitled RBI Circular Document"}
                        </span>
                      </div>
                    </td>

                    {/* Total Chunks */}
                    <td className="py-3.5 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                        <Layers className="w-3 h-3" />
                        {item.total_chunks} chunks
                      </span>
                    </td>

                    {/* Scraped At */}
                    <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(item.scraped_at).toLocaleDateString()}</span>
                        <span className="text-slate-400 text-[10px]">
                          {new Date(item.scraped_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Source URL Action */}
                    <td className="py-3.5 px-6 text-right">
                      {item.source_url ? (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/50 hover:bg-blue-50 px-2.5 py-1 rounded transition"
                        >
                          <span>Open Document</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Bar */}
        {!loading && filteredCirculars.length > 0 && (
          <div className="px-6 py-2.5 border-t border-slate-200/80 bg-white flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Showing <strong className="text-slate-700">{filteredCirculars.length}</strong> of{" "}
              {circulars.length} circular source files
            </span>
            <span className="font-mono">
              Total vectorized corpus: {totalChunksCount.toLocaleString()} chunks
            </span>
          </div>
        )}

      </div>
    </AppLayout>
  );
}