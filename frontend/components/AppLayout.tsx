"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar, { MobileTopbar, MobileDrawer } from "./Sidebar";

/* Responsive app shell — desktop pe sidebar, mobile pe topbar + drawer.
   Public pages (/, /login, /signup, /privacy) AppLayout use nahi karte,
   phir bhi guard rakha hai taaki galti se bhi shell na ghus jaye. */
const PUBLIC_PATHS = ["/", "/login", "/signup", "/privacy"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isPublic) return <>{children}</>;

  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <MobileTopbar onMenu={() => setDrawerOpen(true)} />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
