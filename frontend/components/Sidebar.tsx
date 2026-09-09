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
  ShieldCheck,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  shortcut?: string;
}

const mainLinks: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, shortcut: "⌘1" },
  { href: "/classify", label: "Add & Classify", icon: FilePlus2, shortcut: "⌘2" },
  { href: "/circulars", label: "RBI Circulars", icon: FileText, badge: "Live", shortcut: "⌘3" },
  { href: "/search", label: "Regulatory Search", icon: Search, shortcut: "⌘4" },
  { href: "/company", label: "Entity Profile", icon: Building2, shortcut: "⌘5" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-slate-200/80 min-h-screen flex flex-col justify-between select-none shrink-0 hidden md:flex font-sans">
      {/* Top Workspace Area */}
      <div>
        {/* Tenant / Organization Switcher Header */}
        <div className="p-3 border-b border-slate-100">
          <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors group text-left">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-md bg-slate-950 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
                <ShieldCheck className="h-8 w-8 text-blue-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Link href={"/"} >
                    <span className="text-lg font-bold text-slate-900 truncate tracking-tight">
                    ComplyNext
                  </span>
                  </Link>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-500 font-semibold border border-slate-200/60">
                    BANK
                  </span>
                </div>
                <p className="text-[8px] text-slate-400 truncate mt-0.5 font-medium">
                  HDFC / NBFC Arm
                </p>
              </div>
            </div>
            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="px-3 pt-4">
          <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Platform
          </p>
          <nav className="space-y-0.5">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    active
                      ? "bg-slate-100/90 text-slate-950 font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-50/80"
                  }`}
                >
                  {/* Left subtle indicator pill on active */}
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-blue-600" />
                  )}

                  <div className="flex items-center gap-2.5 min-w-0 pl-1">
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                        active
                          ? "text-blue-600"
                          : "text-slate-400 group-hover:text-slate-700"
                      }`}
                    />
                    <span className="truncate">{link.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {link.badge && (
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        {link.badge}
                      </span>
                    )}
                    {link.shortcut && (
                      <kbd className="hidden group-hover:inline-block font-mono text-[9px] text-slate-400 transition-opacity">
                        {link.shortcut}
                      </kbd>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Compliance Status & Session Action */}
      <div className="p-3 border-t border-slate-100/80 space-y-2">
        {/* Regulatory Engine Mini-Indicator */}
        <div className="px-2.5 py-2 rounded-md bg-slate-50/80 border border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-800 tracking-tight leading-none">
                IRACP Engine
              </p>
              <p className="text-[9px] font-mono text-slate-400 truncate mt-0.5">
                Master Dir. 2024-26
              </p>
            </div>
          </div>
          <span className="text-[9px] font-mono font-semibold px-1 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
            SYNCED
          </span>
        </div>

        {/* Global Sign Out Button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50/60 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 transition-colors" />
            <span>Sign Out</span>
          </div>
          <kbd className="font-mono text-[9px] text-slate-300 group-hover:text-rose-400">
            Esc
          </kbd>
        </button>
      </div>
    </aside>
  );
}