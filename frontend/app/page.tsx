import Link from "next/link";
import {
  ShieldCheck,
  FileSearch,
  Scale,
  BellRing,
  ScrollText,
  Database,
  ArrowRight,
} from "lucide-react";

const MODULES = [
  {
    icon: Database,
    title: "Regulatory corpus",
    desc: "RBI master circulars and directions scraped, chunked and semantically indexed — every answer traceable to its source passage.",
  },
  {
    icon: FileSearch,
    title: "Policy gap detection",
    desc: "Three LangGraph agents retrieve, compare and explain: your policy clauses checked against live regulation with cited verdicts.",
  },
  {
    icon: Scale,
    title: "NPA classification",
    desc: "A deterministic engine applying RBI's exact IRACP day-past-due thresholds — Standard, SMA-0/1/2, NPA — with misclassification flags.",
  },
  {
    icon: BellRing,
    title: "Change monitor",
    desc: "Watches published circulars for changes and raises alerts when an update touches your compliance posture.",
  },
  {
    icon: ScrollText,
    title: "Audit trail",
    desc: "Every decision logged with timestamps and citations, exportable as a formal PDF compliance report.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Create your workspace",
    desc: "Register your NBFC or co-operative bank. Your data stays isolated to your institution — always.",
  },
  {
    n: "02",
    title: "Upload policies & portfolios",
    desc: "Drop in internal policy documents and loan books (single entry or bulk CSV).",
  },
  {
    n: "03",
    title: "Stay continuously compliant",
    desc: "Gap findings, classifications, change alerts and audit reports — in one place, always current.",
  },
];

export default function Home() {
  return (
    <div className="landing min-h-screen">
      {/* bulletin bar */}
      <div className="bg-[#1c1917] px-4 py-2.5 text-center text-xs text-[#e7e0d5]">
        <span className="mr-2 rounded bg-[#b45309] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Regulatory bulletin
        </span>
        Aligned with RBI IRACP Master Direction guidelines
      </div>

      {/* header */}
      <header className="sticky top-0 z-50 border-b border-[#e7e0d5] bg-[#faf7f1]/95 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#1c1917] text-[#faf7f1]">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="font-display text-xl">ComplyNext</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-[#57534e] md:flex">
            <Link href="#platform" className="transition-colors hover:text-[#1c1917]">
              Platform
            </Link>
            <Link href="#how" className="transition-colors hover:text-[#1c1917]">
              How it works
            </Link>
            <Link href="#security" className="transition-colors hover:text-[#1c1917]">
              Security
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* hero */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-16 md:pb-24 md:pt-24">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">RBI compliance intelligence</p>
          <h1 className="font-display text-5xl leading-[1.05] md:text-7xl">
            Compliance that keeps up with the regulator.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#78716c]">
            ComplyNext watches RBI circulars, checks your policies against
            them, classifies your loan book by the exact prudential norms —
            and keeps a paper trail of everything.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary">
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#platform" className="btn-ghost">
              See the platform
            </Link>
          </div>
          <div className="mono mt-10 flex flex-wrap gap-x-8 gap-y-2 text-xs text-[#a8a29e]">
            <span>5 intelligence modules</span>
            <span>multi-tenant by design</span>
            <span>cited, auditable outputs</span>
          </div>
        </div>
      </section>

      {/* modules */}
      <section id="platform" className="border-t border-[#e7e0d5]">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <p className="eyebrow mb-3">The platform</p>
          <h2 className="font-display max-w-2xl text-3xl md:text-4xl">
            One system for the whole compliance loop.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.title} className="panel panel-pad">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#fef3e2] text-[#b45309]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{m.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#78716c]">
                    {m.desc}
                  </p>
                </div>
              );
            })}
            <div className="panel panel-pad flex flex-col justify-between bg-[#1c1917] text-[#faf7f1]">
              <div>
                <h3 className="font-display text-2xl">
                  Built for smaller institutions.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#a8a29e]">
                  Enterprise RegTech, minus the enterprise price tag. Free
                  tiers, open components, zero license cost.
                </p>
              </div>
              <Link
                href="/signup"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#faf7f1] underline underline-offset-4"
              >
                Create your workspace <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="border-t border-[#e7e0d5] bg-[#f5f0e8]/60">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <p className="eyebrow mb-3">How it works</p>
          <h2 className="font-display max-w-2xl text-3xl md:text-4xl">
            Three steps to continuous compliance.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="panel panel-pad">
                <p className="mono text-sm text-[#b45309]">{s.n}</p>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#78716c]">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* security */}
      <section id="security" className="border-t border-[#e7e0d5]">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="eyebrow mb-3">Security & governance</p>
              <h2 className="font-display text-3xl md:text-4xl">
                Your books stay yours.
              </h2>
              <p className="mt-4 leading-relaxed text-[#78716c]">
                Multi-tenant isolation is enforced on every request — one
                institution can never see another&apos;s data. Passwords are
                bcrypt-hashed, sessions are signed tokens, and the audit
                trail records who did what, when, and on which authority.
              </p>
              <Link
                href="/privacy"
                className="mt-4 inline-block text-sm font-medium text-[#b45309] underline underline-offset-4"
              >
                Read the privacy policy
              </Link>
            </div>
            <div className="panel panel-pad">
              <p className="mono text-xs text-[#a8a29e]">isolation check</p>
              <div className="mono mt-3 space-y-2 text-xs">
                <p>
                  <span className="text-[#047857]">✓</span> company_id from
                  signed token — never from client input
                </p>
                <p>
                  <span className="text-[#047857]">✓</span> bcrypt password
                  hashing, JWT sessions
                </p>
                <p>
                  <span className="text-[#047857]">✓</span> timestamped audit
                  log on every decision
                </p>
                <p>
                  <span className="text-[#047857]">✓</span> exportable PDF
                  compliance reports
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="border-t border-[#e7e0d5]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-16 text-center md:py-20">
          <h2 className="font-display max-w-2xl text-4xl md:text-5xl">
            Stop tracking circulars by hand.
          </h2>
          <p className="mt-4 max-w-md text-[#78716c]">
            Set up your institution&apos;s workspace in a minute. Upload a policy,
            run the agents, see the gaps.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="btn-primary">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="btn-ghost">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-[#e7e0d5]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-[#a8a29e] sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-[#1c1917] text-[#faf7f1]">
              <ShieldCheck className="h-3 w-3" />
            </span>
            <span>
              © {new Date().getFullYear()} ComplyNext · RBI compliance
              intelligence
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-[#1c1917]">
              Privacy Policy
            </Link>
            <Link href="/login" className="hover:text-[#1c1917]">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
