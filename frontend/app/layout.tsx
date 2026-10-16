import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/AppLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ComplyNext — RBI Compliance Intelligence",
    template: "%s · ComplyNext",
  },
  description:
    "AI-driven compliance intelligence for RBI-regulated NBFCs and co-operative banks. Policy gap detection, NPA classification, circular monitoring and audit trails.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable}`}
    >
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
