"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { getToken, logout } from "@/lib/auth";
import {
  ShieldCheck,
  Building2,
  LogOut,
  Menu,
} from "lucide-react";

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

export default function Navbar({ onOpenMobileMenu }: NavbarProps) {
  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/company/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data?.name) {
          setCompanyName(res.data.name);
        }
      })
      .catch(() => {
        // Fallback silently if company fails to load
      });
  }, []);

  return (
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between select-none font-sans">
      {/* Left: Mobile Menu + Entity / Unit Context */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Mobile Brand */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 tracking-tight">ComplyNext</span>
        </div>

        {/* Desktop Tenant & Connection Pill */}
        <div className="hidden md:flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-xs">
              {companyName || "Entity Workspace"}
            </span>
          </div>
          <span className="text-slate-300">/</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Core Banking Connected
          </span>
        </div>
      </div>

      {/* Right: Company Name & Direct Sign Out */}
      <div className="flex items-center gap-3">
        {companyName && (
          <span className="hidden sm:inline-block text-xs font-medium text-slate-500 max-w-[200px] truncate">
            {companyName}
          </span>
        )}

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/60 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}