"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface ClassificationResult {
  account_id: string;
  borrower_name: string;
  days_past_due: number;
  computed_classification: string;
  existing_classification: string;
  is_misclassified: boolean;
  reasoning: string;
}

const statusColor: Record<string, string> = {
  "Standard": "bg-green-100 text-green-800",
  "SMA-0": "bg-yellow-100 text-yellow-800",
  "SMA-1": "bg-orange-100 text-orange-800",
  "SMA-2": "bg-orange-200 text-orange-900",
  "NPA": "bg-red-100 text-red-800",
  "Substandard": "bg-red-200 text-red-900",
  "Doubtful": "bg-purple-100 text-purple-800",
  "Loss": "bg-gray-800 text-white",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Dashboard() {
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassifications = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/classify`);
        setResults(res.data);
      } catch (err) {
        console.error("Failed to fetch classification data:", err);
        setError("Unable to connect to the classification service.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassifications();
  }, []);

  const misclassifiedCount = results.filter((r) => r.is_misclassified).length;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ComplyNext Dashboard</h1>
        <p className="text-gray-600 mt-1">NPA / Asset Classification Engine — live results</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Accounts</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{loading ? "..." : results.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Misclassified Accounts</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{loading ? "..." : misclassifiedCount}</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="mt-6 bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Loan Accounts</h2>
          <span className="text-xs text-gray-500">Auto-refreshed via FastAPI</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading classification engine...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 font-medium">{error}</div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No loan account records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-3">Account ID</th>
                  <th className="p-3">Borrower</th>
                  <th className="p-3">DPD</th>
                  <th className="p-3">Computed</th>
                  <th className="p-3">Existing</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Reasoning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((r) => {
                  const badgeClass = statusColor[r.computed_classification] || "bg-gray-100 text-gray-800";
                  
                  return (
                    <tr key={r.account_id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-mono text-xs text-gray-700">{r.account_id}</td>
                      <td className="p-3 font-medium text-gray-900">{r.borrower_name}</td>
                      <td className="p-3">{r.days_past_due}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                          {r.computed_classification}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">{r.existing_classification}</td>
                      <td className="p-3">
                        {r.is_misclassified ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200 text-xs">
                            Mismatch
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded border border-green-200 text-xs">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-xs text-gray-500 max-w-xs truncate" title={r.reasoning}>
                        {r.reasoning || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}