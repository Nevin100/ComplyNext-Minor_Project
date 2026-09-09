"use client";

import { useState, useRef, useEffect } from "react";
import { logout } from "@/lib/auth";
import {
  Bell,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

export default function Navbar({ onOpenMobileMenu }: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  return (
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between select-none">
      {/* Left Section: Mobile Menu Trigger + Brand & Unit Status */}
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

        {/* Desktop Tenant Context / Active Branch */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className="text-slate-300">/</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Core Banking Connected
          </span>
        </div>
      </div>

      {/* Right Section: Notifications + Officer Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          type="button"
          aria-label="View notifications"
          className="relative p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div className="h-4 w-px bg-slate-200" />

        {/* User Account Popover */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            aria-expanded={profileOpen}
            aria-haspopup="true"
            onClick={() => setProfileOpen((prev) => !prev)}
            className={`flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg transition text-left border ${
              profileOpen
                ? "bg-slate-50 border-slate-200"
                : "hover:bg-slate-50/80 border-transparent"
            }`}
          >
            <div className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] ring-1 ring-slate-900/10">
              NB
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-none">
                Compliance Officer
              </span>
              <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                Audit Admin
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                profileOpen ? "rotate-180 text-slate-700" : ""
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 py-1.5 z-50 text-xs font-medium text-slate-700 animate-in fade-in slide-in-from-top-1 duration-100">
              <div className="px-3.5 py-2.5 border-b border-slate-100">
                <p className="font-semibold text-slate-900 text-xs">Signed in as</p>
                <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                  officer@bank-audit.in
                </p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Officer Credentials</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Audit Trail Logs</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50/80 flex items-center gap-2.5 font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}