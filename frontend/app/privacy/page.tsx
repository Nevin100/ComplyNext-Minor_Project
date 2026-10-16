import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. What we collect",
    body: [
      "Account data: your name, institutional email address and a bcrypt-hashed password. We never store plain-text passwords.",
      "Company profile: the name of your NBFC or co-operative bank and basic profile details you provide.",
      "Loan accounts: the portfolio records you upload (account IDs, borrower names, days-past-due, outstanding amounts and existing classifications) for NPA staging analysis.",
      "Policy documents: the internal policy files (.txt/.pdf) you upload for gap detection, and the analysis findings generated from them.",
      "Audit trail: a timestamped log of actions taken in your workspace (classifications, analyses, scrapes) so every decision stays traceable.",
    ],
  },
  {
    title: "2. How we use it",
    body: [
      "Solely to operate the ComplyNext service for your institution: authentication, compliance analysis, monitoring and reporting.",
      "We do not sell your data. We do not share it with advertisers or unrelated third parties.",
      "Policy text you submit for gap analysis is processed by our language-model inference provider to produce the analysis; it is not used for advertising.",
    ],
  },
  {
    title: "3. Data isolation",
    body: [
      "ComplyNext is multi-tenant. Every record belongs to exactly one company, and every request is scoped to the company in your signed-in session. One institution cannot see another institution's loan books, policies or audit logs.",
      "RBI circulars in the shared regulatory corpus are public documents, not personal data, and are the same for every user.",
    ],
  },
  {
    title: "4. Cookies and local storage",
    body: [
      "We store a signed authentication token in your browser's local storage to keep you signed in. We do not use third-party tracking cookies.",
      "Clearing your browser storage signs you out; nothing else about the service changes.",
    ],
  },
  {
    title: "5. Data retention and deletion",
    body: [
      "Your workspace data is kept while your account is active. You can delete loan accounts and policy documents from inside the app at any time.",
      "To request complete deletion of your account and company data, write to us at the contact below and we will remove it.",
    ],
  },
  {
    title: "6. Security",
    body: [
      "Passwords are hashed with bcrypt. API access requires a signed token on every request. That said, no internet service can promise perfect security, so avoid uploading anything you would not want processed by a cloud service.",
    ],
  },
  {
    title: "7. Changes to this policy",
    body: [
      "If this policy changes materially, we will update the date below and highlight the change in the app.",
    ],
  },
  {
    title: "8. Contact",
    body: [
      "For privacy questions or deletion requests: nevinbali10@gmail.com.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="landing min-h-screen">
      <header className="border-b border-[#e7e0d5]">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#1c1917] text-[#faf7f1]">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="font-display text-xl">ComplyNext</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#78716c] hover:text-[#1c1917]"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
        <p className="eyebrow mb-3">Legal</p>
        <h1 className="font-display text-4xl md:text-5xl">Privacy Policy</h1>
        <p className="mono mt-3 text-xs text-[#a8a29e]">
          Last updated: October 2026
        </p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.title} className="panel panel-pad">
              <h2 className="font-display text-xl">{s.title}</h2>
              <ul className="mt-3 space-y-2">
                {s.body.map((b, i) => (
                  <li
                    key={i}
                    className="text-sm leading-relaxed text-[#57534e]"
                  >
                    {b}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="mt-12 border-t border-[#e7e0d5] pt-6 text-center text-xs text-[#a8a29e]">
          © {new Date().getFullYear()} ComplyNext ·{" "}
          <Link href="/" className="underline hover:text-[#1c1917]">
            Home
          </Link>
        </footer>
      </main>
    </div>
  );
}
