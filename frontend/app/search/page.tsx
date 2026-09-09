/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getToken } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";

interface SearchResult {
  title: string;
  content: string;
  source_url: string;
  score: number;
}

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token || !query.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/search-circulars`,
        {
          params: { query },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResults(res.data);
    } catch {
      setError("Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) return null;

  return (
    <AppLayout>
      <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Search Circulars</h1>
        <p className="text-gray-600 mt-1 text-sm">Ask questions against scraped RBI circulars (RAG-powered)</p>
      </header>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. What is the NPA classification period for agricultural loans?"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <div className="mb-4 text-sm bg-red-50 text-red-600 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-500 py-8">Searching circulars...</div>
      ) : searched && results.length === 0 && !error ? (
        <div className="text-center text-gray-500 py-8">No relevant circulars found.</div>
      ) : (
        <div className="space-y-4">
          {results.map((r, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow border border-gray-100 p-5"
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{r.title}</h3>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap">
                  {(r.score * 100).toFixed(0)}% match
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{r.content}</p>
              {r.source_url && (
                <a
                  href={r.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View source →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
    </AppLayout>
  );
}