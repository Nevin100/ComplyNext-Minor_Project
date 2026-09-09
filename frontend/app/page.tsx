import Link from "next/link";
import {
  ShieldCheck,
  Search,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  Lock,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans scroll-smooth">
      {/* Top Advisory Banner */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2.5 px-4 text-center font-medium border-b border-slate-800">
        <span className="bg-blue-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white mr-2">
          Regulatory Bulletin
        </span>
        <span>Aligned with RBI IRACP Master Direction Guidelines</span>
        <Link
          href="#circulars"
          className="text-white underline hover:text-slate-200 ml-2 font-semibold"
        >
          View Directives &rarr;
        </Link>
      </div>

      {/* Primary Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-950">
              Comply<span className="text-blue-600">Next</span>
            </span>
          </Link>

          {/* Functional Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <Link href="#features" className="hover:text-blue-600 transition-colors">
              Platform Features
            </Link>
            <Link href="#solutions" className="hover:text-blue-600 transition-colors">
              Institutional Framework
            </Link>
            <Link href="#circulars" className="hover:text-blue-600 transition-colors">
              Circular Indexer
            </Link>
            <Link href="#security" className="hover:text-blue-600 transition-colors">
              Audit & Governance
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all shadow-xs"
            >
              <span>Provision Instance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
              RBI Compliance, <br />
              <span className="text-blue-600">Deterministic & Audit-Ready.</span>
            </h1>

            <p className="mt-6 text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
              Continuous DPD classification, multi-tenant asset segregation, and vector-indexed RBI circular tracking engineered strictly for Scheduled Commercial Banks and NBFCs.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-6 py-3 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <span>Deploy Organization Enclave</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-md font-semibold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-200 transition text-xs sm:text-sm text-center"
              >
                Live Ledger Demo
              </Link>
            </div>

            {/* Micro-Badges */}
            <div className="mt-10 pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>IRACP Master Staging (SMA-0/1/2)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Isolated Multi-Tenant Ledger Schemas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Immutable Statutory Audit Logs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Deterministic Zero-Provision Drift</span>
              </div>
            </div>
          </div>

          {/* Hero Right Ledger Preview Card */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                </div>
                <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  ENGINE: ACTIVE / RBI-IRACP-2026
                </span>
              </div>

              <div className="py-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Scanned Capital</span>
                  <p className="text-xl font-bold text-slate-900 font-mono">₹148.42 Cr</p>
                </div>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                  0 Unreconciled
                </span>
              </div>

              {/* Sample Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <div className="grid grid-cols-3 bg-slate-50 p-2 font-semibold text-slate-500 text-[11px] border-b border-slate-200">
                  <span>Account</span>
                  <span className="text-center">Overdue</span>
                  <span className="text-right">Computed</span>
                </div>
                <div className="divide-y divide-slate-100 font-mono">
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="text-slate-800 font-semibold">LN101</span>
                    <span className="text-center text-slate-500">0d</span>
                    <span className="text-right">
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        STANDARD
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 items-center bg-amber-50/30">
                    <span className="text-slate-800 font-semibold">LN102</span>
                    <span className="text-center font-bold text-amber-700">75d</span>
                    <span className="text-right">
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800">
                        SMA-2
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 items-center bg-rose-50/30">
                    <span className="text-slate-800 font-semibold">LN103</span>
                    <span className="text-center font-bold text-rose-700">95d</span>
                    <span className="text-right">
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-800">
                        NPA
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium text-[11px]">Audit Citation Generated</span>
                <span className="text-[11px] font-mono text-blue-600 font-semibold">
                  Rule Ref: IRACP-Norms
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Target ID #features */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200 scroll-mt-20">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Deterministic Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mt-1.5">
            Core Regulatory Engine Modules
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">
            Built to eliminate core-banking provisioning discrepancies during statutory inspections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-5">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-950 mb-2">Automated Staging</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Batch processing for daily overdue balances. Flags discrepancies between core-banking asset categories and statutory IRACP classifications.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 mb-5">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-950 mb-2">Vectorized Circular Retrieval</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Chunk-level semantic embeddings over the entire archive of RBI Master Directions. Direct clause citations for credit review committees.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 mb-5">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-950 mb-2">Tenant Encapsulation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Row-Level Security (RLS) and strict institutional scoping. Complete isolation between separate bank branches, NBFC entities, and audit units.
            </p>
          </div>
        </div>
      </section>

      {/* Target ID #solutions */}
      <section id="solutions" className="py-20 px-6 bg-slate-50/70 border-t border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Institutional Framework
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              Built for Scheduled Banks & Non-Banking Lenders
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              ComplyNext bridges the operational divide between core lending systems and the Reserve Bank of India’s updated prudential guidelines.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-950 mb-1.5">For Scheduled Commercial Banks</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated identification of SMA accounts prior to standard reporting cycles, mitigating sudden provisioning jumps.
              </p>
            </div>
            <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-950 mb-1.5">For Retail & Scale NBFCs</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamless CSV or REST API ledger ingestion with automated compliance receipts for external regulatory auditors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target ID #circulars */}
      <section id="circulars" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200 scroll-mt-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Live Regulatory Registry
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mt-1.5">
            Continuous Circular Tracking
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">
            Automated crawlers indexing Master Directions directly into accessible vector chunks.
          </p>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs text-xs">
          <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 font-semibold text-slate-600 flex justify-between items-center">
            <span>Official Directives & Classification Scope</span>
            <span className="font-mono text-[11px] text-slate-400">rbi.org.in</span>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-bold text-slate-900">RBI Master Circular - Prudential Norms on IRACP</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Asset classification, provisioning norms & income recognition</p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                ACTIVE NORM
              </span>
            </div>
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-bold text-slate-900">Framework for Revitalising Distressed Assets</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Early detection of stress and SMA-0/1/2 reporting timelines</p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 w-fit">
                INDEXED CHUNKS
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Target ID #security */}
      <section id="security" className="py-20 px-6 bg-slate-900 text-white scroll-mt-20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-blue-400">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Enterprise Security & Tenant Isolation
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            Role-based access controls, encrypted tenant partitions, and immutable audit logs designed for on-premise or private VPC deployments.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-md font-semibold bg-blue-600 hover:bg-blue-500 text-white transition text-xs"
            >
              Request Institutional Pilot
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-md font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700 text-xs"
            >
              Sign In to Enclave
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>&copy; {new Date().getFullYear()} ComplyNext. Banking & Lending Compliance Stack.</span>
          </div>
          <div className="flex gap-6 font-medium">
            <Link href="#features" className="hover:text-slate-900">Features</Link>
            <Link href="#solutions" className="hover:text-slate-900">Solutions</Link>
            <Link href="#circulars" className="hover:text-slate-900">Circulars</Link>
            <Link href="#security" className="hover:text-slate-900">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}