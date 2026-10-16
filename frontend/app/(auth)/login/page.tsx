"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";
import { ErrorBox } from "@/components/ui";

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
      setError(
        err?.response?.data?.detail || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing flex min-h-screen flex-col">
      <header className="border-b border-[#e7e0d5]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#1c1917] text-[#faf7f1]">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="font-display text-xl">ComplyNext</span>
          </Link>
          <span className="mono hidden text-xs text-[#a8a29e] sm:block">
            officer sign-in
          </span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="panel panel-pad sm:p-8">
            <p className="eyebrow mb-3">Welcome back</p>
            <h1 className="font-display text-3xl">Sign in</h1>
            <p className="mt-1.5 text-sm text-[#78716c]">
              Access your institution&apos;s workspace.
            </p>

            {error && (
              <div className="mt-5">
                <ErrorBox>{error}</ErrorBox>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="label" htmlFor="email">
                  Institutional email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="officer@yourbank.in"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="input pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#1c1917]"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Verifying…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-[#e7e0d5] pt-5 text-center text-sm text-[#78716c]">
              New institution?{" "}
              <Link
                href="/signup"
                className="font-medium text-[#b45309] underline underline-offset-4"
              >
                Create a workspace
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#e7e0d5] py-5 text-center text-xs text-[#a8a29e]">
        © {new Date().getFullYear()} ComplyNext ·{" "}
        <Link href="/privacy" className="underline hover:text-[#1c1917]">
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
