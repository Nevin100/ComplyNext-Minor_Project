/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getToken, logout } from "@/lib/auth";

interface Company {
  id: number;
  name: string;
  created_at: string | null;
  total_users: number;
  total_loan_accounts: number;
}

export default function CompanyPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [form, setForm] = useState({ name: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthChecked(true);

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/company/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCompany(res.data);
        setForm({ name: res.data.name });
      })
      .catch((err) => {
        if (err?.response?.status === 401) router.push("/login");
        else setError("Failed to load company profile.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setMsg("");
    setError("");
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/company/me`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompany(res.data);
      setMsg("Profile updated successfully.");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const token = getToken();
    if (!token) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/company/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
    } catch {
      setError("Failed to delete account.");
    }
  };

  if (!authChecked) return null;

  return (
    <main className="p-4 sm:p-8">
      <header className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Company Profile</h1>
        <p className="text-gray-600 mt-1 text-sm">Manage your organization&apos;s account details</p>
      </header>

      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading profile...</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-lg">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{company?.total_users}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
              <p className="text-sm font-medium text-gray-500">Loan Accounts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{company?.total_loan_accounts}</p>
            </div>
          </div>

          <div className="max-w-lg bg-white rounded-lg shadow border border-gray-100 p-6">
            {msg && (
              <div className="mb-4 text-sm bg-green-50 text-green-700 border border-green-200 rounded-md p-2">
                {msg}
              </div>
            )}
            {error && (
              <div className="mb-4 text-sm bg-red-50 text-red-600 border border-red-200 rounded-md p-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {company?.created_at && (
                <p className="text-xs text-gray-400">
                  Account created: {new Date(company.created_at).toLocaleDateString()}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-red-600 mb-2">Danger Zone</h3>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 font-medium"
                >
                  Delete Company Account
                </button>
              ) : (
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-sm text-gray-600">Are you sure? This can&apos;t be undone.</span>
                  <button
                    onClick={handleDelete}
                    className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}