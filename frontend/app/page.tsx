import Link from "next/link";
import {
  ShieldCheck,
  Search,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  FileText,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white text-xs py-2.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="bg-blue-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white">
          Update
        </span>
        <span>Updated with RBI IRACP Master Circular Guidelines (2025–26)</span>
        <Link href="#updates" className="underline hover:text-slate-200 ml-1 font-semibold">
          Read notifications &rarr;
        </Link>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-950">
              Comply<span className="text-blue-600">Next</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-blue-600 transition-colors">
              Features
            </Link>
            <Link href="#solutions" className="hover:text-blue-600 transition-colors">
              Banks & NBFCs
            </Link>
            <Link href="#circulars" className="hover:text-blue-600 transition-colors">
              Circular Tracker
            </Link>
            <Link href="#security" className="hover:text-blue-600 transition-colors">
              Audit & Security
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              <span>Request Access</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section: Left Text + Right Image Layout */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column (Hero Content) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Regulatory Compliance Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
              RBI Compliance, <br />
              <span className="text-blue-600">Automated & Auditable.</span>
            </h1>

            <p className="mt-6 text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
              Deterministic rule engines for multi-tenant NPA staging (SMA-0, SMA-1, SMA-2), automated regulatory filing, and continuous RBI circular compliance for Scheduled Banks and NBFCs.
            </p>

            {/* CTA Group */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 text-center flex items-center justify-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-all text-center"
              >
                Explore Dashboard
              </Link>
            </div>

            {/* Trust Checklist */}
            <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>IRACP Master Direction Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Multi-Tenant Schema Isolation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Immutable Audit Logs for Inspection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Daily DPD Batch Processing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Image / Interactive Product Preview */}
          <div className="lg:col-span-5 relative">
            
            {/* NOTE: Agar aapko apni Image lagani hai, toh neeche wale div ko uncomment karke 'dashboard-preview.png' daal sakte hain:
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-white">
              <Image 
                src="/dashboard-preview.png" 
                alt="ComplyNext Platform Overview" 
                width={700} 
                height={550} 
                className="w-full h-auto object-cover"
              />
            </div>
            */}

            {/* Live Stand-in Mockup Box (Looks extremely authentic & sharp) */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/80">
              
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  IRACP Staging: Live
                </span>
              </div>

              {/* Status Header */}
              <div className="py-4 flex justify-between items-center">
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">Asset Classification</h4>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">₹ 148.42 Cr Portfolio</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Daily Run: Passed
                </span>
              </div>

              {/* Mock Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <div className="grid grid-cols-3 bg-slate-50 p-2.5 font-semibold text-slate-600 border-b border-slate-200">
                  <span>Account ID</span>
                  <span className="text-center">DPD</span>
                  <span className="text-right">Classification</span>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-mono text-slate-800">ACC-90412</span>
                    <span className="text-center font-medium text-slate-600">0 Days</span>
                    <span className="text-right">
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700">STANDARD</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 items-center bg-amber-50/40">
                    <span className="font-mono text-slate-800">ACC-78331</span>
                    <span className="text-center font-bold text-amber-700">34 Days</span>
                    <span className="text-right">
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800">SMA-1</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 items-center bg-rose-50/40">
                    <span className="font-mono text-slate-800">ACC-54190</span>
                    <span className="text-center font-bold text-rose-700">68 Days</span>
                    <span className="text-right">
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-800">SMA-2</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-mono text-slate-800">ACC-11029</span>
                    <span className="text-center font-medium text-slate-600">12 Days</span>
                    <span className="text-right">
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800">SMA-0</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Mock Floating Tag */}
              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>RBI Audit Report Generated</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-blue-600 hover:underline cursor-pointer">
                  Export PDF
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Trust Numbers Strip */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-950">100%</p>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">IRACP Rule Compliance</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-950">24/7</p>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Real-time Circular Crawlers</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-950">&lt; 100ms</p>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Classification Latency</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-950">Zero</p>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Manual Provisioning Error</p>
          </div>
        </div>
      </section>

      {/* Features Grid: High Professionalism */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Core Modules
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mt-2">
            Engineered Specifically for Regulatory Scrutiny
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Say goodbye to fragile spreadsheets and manual DPD classification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="p-8 rounded-xl border border-slate-200 bg-white hover:shadow-lg transition-all hover:border-blue-200 group">
            <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-950 mb-2">Automated NPA Staging</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Standardized classification for SMA-0, SMA-1, SMA-2 and Substandard/Doubtful assets with exact regulatory provisioning calculation based on collateral values.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-xl border border-slate-200 bg-white hover:shadow-lg transition-all hover:border-blue-200 group">
            <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-950 mb-2">RBI Circular Indexing</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Real-time monitoring of notifications from the Reserve Bank of India. Automated tagging against relevant operational policies and credit committees.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-xl border border-slate-200 bg-white hover:shadow-lg transition-all hover:border-blue-200 group">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-950 mb-2">Multi-Tenant Vaults</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Complete tenant separation for banks operating subsidiary NBFCs or multiple lending entities, with fine-grained role permissions and RBAC controls.
            </p>
          </div>

        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to streamline your regulatory audits?
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base max-w-xl mx-auto">
            Deploy ComplyNext on-premise or into your private VPC with standard banking compliance checklists.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm"
            >
              Start Free Pilot
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 text-sm"
            >
              Contact Solutions Architect
            </Link>
          </div>
        </div>
      </section>

      {/* Clean Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>© {new Date().getFullYear()} ComplyNext. Built for Banking & Lending Institutions.</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-900">Documentation</Link>
            <Link href="#" className="hover:text-slate-900">Security Specs</Link>
            <Link href="#" className="hover:text-slate-900">Audit Compliance</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}