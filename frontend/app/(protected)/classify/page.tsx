/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getToken, logout } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";

export default function ClassifyPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  // single loan form
  const [form, setForm] = useState({
    account_id: "",
    borrower_name: "",
    days_past_due: "",
    existing_classification: "Standard",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState("");

  // bulk upload
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [bulkMsg, setBulkMsg] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthChecked(true);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSubmitting(true);
    setFormMsg("");
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/loans`,
        { ...form, days_past_due: Number(form.days_past_due) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormMsg("Loan account added successfully.");
      setForm({
        account_id: "",
        borrower_name: "",
        days_past_due: "",
        existing_classification: "Standard",
      });
    } catch (err: any) {
      setFormMsg(err?.response?.data?.detail || "Failed to add loan account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
    const token = getToken();
    if (!token || !file) return;
    setUploading(true);
    setBulkMsg("");
    try {
      const data = new FormData();
      data.append("file", file);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/loans/bulk`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setBulkMsg("Bulk upload successful.");
      setFile(null);
    } catch (err: any) {
      setBulkMsg(err?.response?.data?.detail || "Bulk upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (!authChecked) return null;

  return (
    <AppLayout>
      <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="mb-6 flex justify-between items-start sm:items-center flex-col sm:flex-row gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add Loan Accounts</h1>
          <p className="text-gray-600 mt-1 text-sm">Add single records or bulk upload via CSV</p>
        </div>
        <button
          onClick={logout}
          className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 font-medium"
        >
          Logout
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Entry Form */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Single Loan Entry</h2>

          {formMsg && (
            <div className="mb-4 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md p-2">
              {formMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account ID</label>
              <input
                type="text"
                name="account_id"
                value={form.account_id}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Borrower Name</label>
              <input
                type="text"
                name="borrower_name"
                value={form.borrower_name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Days Past Due</label>
              <input
                type="number"
                name="days_past_due"
                value={form.days_past_due}
                onChange={handleChange}
                required
                min={0}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Existing Classification</label>
              <select
                name="existing_classification"
                value={form.existing_classification}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Standard</option>
                <option>SMA-0</option>
                <option>SMA-1</option>
                <option>SMA-2</option>
                <option>NPA</option>
                <option>Substandard</option>
                <option>Doubtful</option>
                <option>Loss</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Loan Account"}
            </button>
          </form>
        </div>

        {/* Bulk Upload */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Bulk Upload (CSV)</h2>

          {bulkMsg && (
            <div className="mb-4 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md p-2">
              {bulkMsg}
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-medium hover:file:bg-blue-100"
            />
            {file && (
              <p className="text-xs text-gray-500 mt-3">Selected: {file.name}</p>
            )}
          </div>

          <button
            onClick={handleFileUpload}
            disabled={!file || uploading}
            className="w-full mt-4 bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload CSV"}
          </button>

          <p className="text-xs text-gray-400 mt-3">
            Expected columns: account_id, borrower_name, days_past_due, existing_classification
          </p>
        </div>
      </div>
    </main>
    </AppLayout>
  );
}