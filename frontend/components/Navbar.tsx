"use client";
import { logout } from "@/lib/auth";

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
      <span className="text-lg font-bold text-blue-600">ComplyNext</span>
      <button
        onClick={logout}
        className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 font-medium"
      >
        Logout
      </button>
    </header>
  );
}