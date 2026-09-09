"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        form
      );
      localStorage.setItem("token", res.data.access_token);
      router.push("/dashboard");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid credentials or unauthorized officer account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Micro Top Header */}
      <header className="px-6 py-5 border-b border-slate-150 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-950">
            Comply<span className="text-blue-600">Next</span>
          </span>
        </Link>
        <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">
          IRACP Compliance Portal v2.6
        </span>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="border border-slate-200/80 rounded-2xl bg-white p-7 sm:p-9 shadow-xl shadow-slate-200/40">
            {/* Header */}
            <div className="mb-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200/70 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                Officer Authentication
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                Sign in to your instance
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Enter your authorized credentials to access tenant books and RBI logs.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="officer@bank-domain.in"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium"
                  >
                    Reset token?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate Officer</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Link */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                New institutional branch?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Provision workspace &rarr;
                </Link>
              </p>
            </div>
          </div>

          {/* Security Subtext */}
          <div className="mt-6 text-center">
            <p className="text-[11px] text-slate-400 font-medium inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>SOC2 & IRACP Compliant Multi-Tenant Enclave</span>
            </p>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-150">
        &copy; {new Date().getFullYear()} ComplyNext Technologies. Regulatory Compliance Infrastructure.
      </footer>
    </div>
  );
}