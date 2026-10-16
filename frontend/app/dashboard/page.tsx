"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Card,
  PageHeader,
  Pill,
  Spinner,
  EmptyState,
  ErrorBox,
} from "@/components/ui";
import {
  ArrowRight,
  FileSearch,
  FileText,
  ScrollText,
  FolderInput,
} from "lucide-react";

interface Stats {
  loans: number;
  policies: number;
  circulars: number;
  alerts: number;
  audit: number;
}

const QUICK_ACTIONS = [
  {
    href: "/classify",
    icon: FolderInput,
    title: "Classify a loan",
    desc: "Run the IRACP NPA staging engine on a new account.",
  },
  {
    href: "/policy-check",
    icon: FileSearch,
    title: "Check a policy",
    desc: "Upload a policy and find gaps against RBI circulars.",
  },
  {
    href: "/circulars",
    icon: FileText,
    title: "Refresh circulars",
    desc: "Re-scrape RBI sources and check for updates.",
  },
  {
    href: "/audit",
    icon: ScrollText,
    title: "View audit trail",
    desc: "Inspect and export the compliance activity log.",
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [loans, circulars, policies, alerts, audit] = await Promise.all([
          api.get("/api/loan-accounts"),
          api.get("/api/circulars"),
          api.get("/api/policies"),
          api.get("/api/circulars/updates"),
          api.get("/api/audit"),
        ]);
        setStats({
          loans: loans.data?.length ?? 0,
          circulars: circulars.data?.length ?? 0,
          policies: policies.data?.length ?? 0,
          alerts: (alerts.data ?? []).filter((a: { seen: boolean }) => !a.seen).length,
          audit: audit.data?.length ?? 0,
        });
      } catch {
        setError("Could not load dashboard data. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner label="Loading dashboard…" />;

  return (
    <>
      <PageHeader
        eyebrow="Command centre"
        title="Compliance overview"
        desc="Your institution's compliance posture at a glance — portfolio, policies, regulatory alerts and the audit trail."
      />

      {error && (
        <div className="mb-6">
          <ErrorBox>{error}</ErrorBox>
        </div>
      )}

      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <p className="eyebrow">Loan accounts</p>
            <p className="font-display mt-2 text-4xl">{stats.loans}</p>
            <p className="mt-1 text-sm text-[#78716c]">
              classified under IRACP norms
            </p>
          </Card>
          <Card>
            <p className="eyebrow">Policy documents</p>
            <p className="font-display mt-2 text-4xl">{stats.policies}</p>
            <p className="mt-1 text-sm text-[#78716c]">
              uploaded for gap analysis
            </p>
          </Card>
          <Card>
            <p className="eyebrow">Regulatory corpus</p>
            <p className="font-display mt-2 text-4xl">{stats.circulars}</p>
            <p className="mt-1 text-sm text-[#78716c]">
              circulars indexed · <span className="mono">{stats.alerts}</span>{" "}
              unseen alerts
            </p>
          </Card>
        </div>
      )}

      <h2 className="font-display mb-3 text-2xl">Quick actions</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.href} href={a.href}>
              <Card className="group flex h-full items-start gap-4 transition-colors hover:border-[#a8a29e]">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#fef3e2] text-[#b45309]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{a.title}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#a8a29e] transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-[#78716c]">
                    {a.desc}
                  </span>
                </span>
              </Card>
            </Link>
          );
        })}
      </div>

      {stats && stats.loans === 0 && stats.policies === 0 && (
        <div className="mt-6">
          <EmptyState
            title="Workspace is fresh"
            desc="Add your first loan account or upload a policy document to see the engines in action."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/classify" className="btn-primary">
                  Add a loan account
                </Link>
                <Link href="/policy-check" className="btn-ghost">
                  Upload a policy
                </Link>
              </div>
            }
          />
        </div>
      )}

      <div className="mono mt-8 text-xs text-[#a8a29e]">
        session scoped to your institution ·{" "}
        <Pill value={stats && stats.alerts > 0 ? "GAP" : "COMPLIANT"} />{" "}
        regulatory posture
      </div>
    </>
  );
}
