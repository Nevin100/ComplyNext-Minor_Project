/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getToken, logout } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";

interface Circular {
  id: number;
  title: string;
  url: string;
  category: string;
  scraped_at: string;
}

export default function CircularsPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState("");

  const fetchCirculars = (token: string) => {
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/circulars`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCirculars(res.data))
      .catch((err) => {
        if (err?.response?.status === 401) router.push("/login");
        else setError("Failed to load circulars.");
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
      setError("Scrape failed. Try again.");
    } finally {
      setScraping(false);
    }
  };

  if (!authChecked) return null;

  return (
    <AppLayout>
      <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="mb-6 flex justify-between items-start sm:items-center flex-col sm:flex-row gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">RBI Circulars</h1>
          <p className="text-gray-600 mt-1 text-sm">Scraped regulatory circulars — IRACP, KYC & more</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {scraping ? "Scraping..." : "Run New Scrape"}
          </button>
          <button
            onClick={logout}
            className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Scraped Circulars</h2>
          <span className="text-xs text-gray-500">{circulars.length} total</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading circulars...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 font-medium">{error}</div>
        ) : circulars.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No circulars yet. Click &apos;Run New Scrape&apos; to fetch.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Scraped At</th>
                  <th className="p-3">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {circulars.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium text-gray-900 max-w-sm truncate" title={c.title}>
                      {c.title}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {c.category}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">
                      {new Date(c.scraped_at).toLocaleString()}
                    </td>
                    <td className="p-3">
                        <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        View →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
    </AppLayout>
  );
}