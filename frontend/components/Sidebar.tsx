"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  Search,
  Building2,
  FileSearch,
  ScrollText,
  ShieldCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/classify", label: "Add & Classify", icon: FilePlus2 },
  { href: "/circulars", label: "RBI Circulars", icon: FileText },
  { href: "/search", label: "Regulatory Search", icon: Search },
  { href: "/policy-check", label: "Policy Gap Check", icon: FileSearch },
  { href: "/audit", label: "Audit Trail", icon: ScrollText },
  { href: "/company", label: "Entity Profile", icon: Building2 },
];

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0e2a30] text-[#f2f7f6]">
        <ShieldCheck className="h-4 w-4" />
      </span>
      <span className="font-display text-xl">ComplyNext</span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {LINKS.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + "/");
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-[#0e2a30] font-medium text-[#f2f7f6]"
                : "text-[#47616a] hover:bg-[#e9f2f0] hover:text-[#0e2a30]"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function EngineStatus() {
  return (
    <div className="panel flex items-center gap-2.5 px-3 py-2.5">
      <span className="status-dot up" />
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-none">IRACP Engine</p>
        <p className="mono mt-1 text-[10px] text-[#93a8ad]">SYNCED</p>
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#d8e6e3] md:flex">
      <div className="p-5">
        <Brand />
      </div>
      <div className="flex-1 overflow-y-auto px-3">
        <NavList />
      </div>
      <div className="space-y-3 border-t border-[#d8e6e3] p-4">
        <EngineStatus />
        <button onClick={logout} className="btn-ghost btn-block">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function MobileTopbar({ onMenu }: { onMenu: () => void }) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#d8e6e3] bg-[#f2f7f6]/95 px-4 py-3 backdrop-blur md:hidden">
      <Brand />
      <button
        onClick={onMenu}
        className="btn-ghost px-2.5 py-2"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>
    </div>
  );
}

export function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-[#f2f7f6] p-5 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <Brand />
          <button
            onClick={onClose}
            className="btn-ghost px-2.5 py-2"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavList onNavigate={onClose} />
        </div>
        <div className="space-y-3 pt-4">
          <EngineStatus />
          <button onClick={logout} className="btn-ghost btn-block">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
