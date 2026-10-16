"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import {
  Card,
  PageHeader,
  Spinner,
  EmptyState,
  ErrorBox,
} from "@/components/ui";
import { Search as SearchIcon } from "lucide-react";

interface SearchResult {
  source_name: string;
  source_url: string;
  chunk_index: number;
  text: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const res = await api.get("/api/search-circulars", {
        params: { query },
      });
      setResults(res.data ?? []);
    } catch {
      setError("Search failed. Is the backend running?");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Regulatory search"
        title="Ask the corpus"
        desc="Semantic search over indexed RBI circulars. Every answer cites the exact passage it came from."
      />

      <Card className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a8a29e]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. When is an account classified as NPA under IRACP?"
              className="input pl-10"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn-primary"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>
      </Card>

      {error && (
        <div className="mb-6">
          <ErrorBox>{error}</ErrorBox>
        </div>
      )}

      {loading && <Spinner label="Searching the corpus…" />}

      {!loading && searched && results.length === 0 && !error && (
        <EmptyState
          title="No passages found"
          desc="Try different wording — the corpus covers IRACP, KYC and related RBI master circulars."
        />
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="mono mb-4 text-xs text-[#a8a29e]">
            {results.length} relevant passage{results.length === 1 ? "" : "s"}
          </p>
          <div className="space-y-4">
            {results.map((r, i) => (
              <Card key={`${r.source_name}-${r.chunk_index}-${i}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="eyebrow">Passage {i + 1}</p>
                  <p className="mono text-xs text-[#a8a29e]">
                    chunk #{r.chunk_index}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#57534e]">
                  {r.text}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#f0ebe1] pt-3">
                  <p className="text-xs font-medium">{r.source_name}</p>
                  <a
                    href={r.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mono break-all text-xs text-[#b45309] underline underline-offset-4"
                  >
                    open source
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}
