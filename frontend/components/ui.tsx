"use client";

import type { ReactNode } from "react";

/* Shared editorial primitives — har page inhi se banta hai,
   taaki poora app ek jaisa dikhe. */

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`panel panel-pad ${className}`}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  desc,
  actions,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
        {desc ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#78716c]">
            {desc}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

/* Pill badge — classification + audit action types, ek hi mapping har page pe. */
const TONES: Record<string, string> = {
  Standard: "bg-[#d1fae5] text-[#047857]",
  "SMA-0": "bg-[#dbeafe] text-[#1d4ed8]",
  "SMA-1": "bg-[#fef3c7] text-[#92400e]",
  "SMA-2": "bg-[#ffedd5] text-[#9a3412]",
  NPA: "bg-[#fee2e2] text-[#b91c1c]",
  COMPLIANT: "bg-[#d1fae5] text-[#047857]",
  GAP: "bg-[#fee2e2] text-[#b91c1c]",
  OUTDATED: "bg-[#fef3c7] text-[#92400e]",
  classification: "bg-[#dbeafe] text-[#1d4ed8]",
  gap_analysis: "bg-[#f3e8ff] text-[#7e22ce]",
  scrape: "bg-[#d1fae5] text-[#047857]",
  monitor_check: "bg-[#fef3c7] text-[#92400e]",
};

export function Pill({ value }: { value: string }) {
  const tone = TONES[value] ?? "bg-[#f5f0e8] text-[#78716c]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}
    >
      {value}
    </span>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-[#78716c]">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#e7e0d5] border-t-[#b45309]" />
      {label}
    </div>
  );
}

export function EmptyState({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel panel-pad flex flex-col items-center px-6 py-14 text-center">
      <p className="font-display text-2xl">{title}</p>
      {desc ? (
        <p className="mt-2 max-w-md text-sm text-[#78716c]">{desc}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return <div className="error-box">{children}</div>;
}

export function OkBox({ children }: { children: ReactNode }) {
  return <div className="ok-box">{children}</div>;
}
