/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Card,
  PageHeader,
  Spinner,
  EmptyState,
  ErrorBox,
  OkBox,
} from "@/components/ui";
import { BellRing, RefreshCw } from "lucide-react";

interface Circular {
  source_name: string;
  source_url: string;
  total_chunks: number;
  scraped_at: string | null;
}

interface Alert {
  id: number;
  source_name: string;
  source_url: string | null;
  summary: string;
  seen: boolean;
  detected_at: string | null;
}

export default function CircularsPage() {
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [scraping, setScraping] = useState(false);
  const [checking, setChecking] = useState(false);

  const fetchAll = async () => {
    try {
      const [c, a] = await Promise.all([
        api.get("/api/circulars"),
        api.get("/api/circulars/updates"),
      ]);
      setCirculars(c.data ?? []);
      setAlerts(a.data ?? []);
    } catch {
      setError("Could not load circulars.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleScrape = async () => {
    setError("");
    setOk("");
    setScraping(true);
    try {
      await api.post("/api/circulars/scrape");
      setOk("Scrape finished. Corpus refreshed.");
      fetchAll();
    } catch {
      setError("Scrape failed. Check the backend logs.");
    } finally {
      setScraping(false);
    }
  };

  const handleCheck = async () => {
    setError("");
    setOk("");
    setChecking(true);
    try {
      const res = await api.post("/api/circulars/check-updates");
      const n = res.data?.new_alerts ?? 0;
      setOk(
        n > 0
          ? `${n} new change alert${n === 1 ? "" : "s"} detected.`
          : "Checked — no changes since the last snapshot."
      );
      fetchAll();
    } catch {
      setError("Update check failed.");
    } finally {
      setChecking(false);
    }
  };

  const markSeen = async (id: number) => {
    try {
      await api.put(`/api/circulars/updates/${id}/seen`);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, seen: true } : a))
      );
    } catch {
      /* non-blocking */
    }
  };

  if (loading) return <Spinner label="Loading circulars…" />;

  const unseen = alerts.filter((a) => !a.seen);
  const seen = alerts.filter((a) => a.seen);

  return (
    <>
      <PageHeader
        eyebrow="Regulatory corpus"
        title="RBI circulars"
        desc="Indexed RBI circulars and the change monitor. Re-scrape to refresh the corpus, or check for updates to catch changed sources."
        actions={
          <>
            <button
              onClick={handleCheck}
              disabled={checking}
              className="btn-ghost"
            >
              <RefreshCw
                className={`h-4 w-4 ${checking ? "animate-spin" : ""}`}
              />
              {checking ? "Checking…" : "Check for updates"}
            </button>
            <button
              onClick={handleScrape}
              disabled={scraping}
              className="btn-primary"
            >
              {scraping ? "Scraping…" : "Re-scrape corpus"}
            </button>
          </>
        }
      />

      {error && (
        <div className="mb-4">
          <ErrorBox>{error}</ErrorBox>
        </div>
      )}
      {ok && (
        <div className="mb-4">
          <OkBox>{ok}</OkBox>
        </div>
      )}

      {/* change alerts */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <BellRing className="h-4 w-4 text-[#b45309]" />
          <h2 className="font-display text-2xl">Change alerts</h2>
          {unseen.length > 0 && (
            <span className="rounded-full bg-[#b91c1c] px-2.5 py-0.5 text-xs font-bold text-white">
              {unseen.length} new
            </span>
          )}
        </div>

        {alerts.length === 0 ? (
          <EmptyState
            title="No changes detected"
            desc="The monitor snapshots every source and alerts when content changes. Run a check to verify."
          />
        ) : (
          <div className="space-y-3">
            {unseen.map((a) => (
              <Card key={a.id} className="border-l-4 !border-l-[#b45309]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">{a.source_name}</p>
                    {a.source_url && (
                      <p className="mono mt-1 break-all text-xs text-[#a8a29e]">
                        {a.source_url}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-[#78716c]">{a.summary}</p>
                    {a.detected_at && (
                      <p className="mono mt-2 text-xs text-[#a8a29e]">
                        detected {new Date(a.detected_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => markSeen(a.id)}
                    className="btn-ghost shrink-0"
                  >
                    Mark as seen
                  </button>
                </div>
              </Card>
            ))}
            {seen.length > 0 && (
              <details>
                <summary className="cursor-pointer text-sm text-[#78716c] hover:text-[#1c1917]">
                  {seen.length} acknowledged alert{seen.length === 1 ? "" : "s"}
                </summary>
                <div className="mt-3 space-y-3 opacity-70">
                  {seen.map((a) => (
                    <Card key={a.id}>
                      <p className="text-sm font-medium">{a.source_name}</p>
                      <p className="mt-1 text-sm text-[#78716c]">{a.summary}</p>
                    </Card>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {/* indexed circulars */}
      <h2 className="font-display mb-3 text-2xl">Indexed circulars</h2>
      {circulars.length === 0 ? (
        <EmptyState
          title="Corpus is empty"
          desc="Run a scrape to pull RBI circulars into the index."
          action={
            <button
              onClick={handleScrape}
              disabled={scraping}
              className="btn-primary"
            >
              {scraping ? "Scraping…" : "Scrape now"}
            </button>
          }
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Chunks</th>
                  <th>Scraped</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {circulars.map((c, i) => (
                  <tr key={`${c.source_name}-${i}`}>
                    <td className="max-w-[280px] font-medium">
                      {c.source_name}
                    </td>
                    <td className="mono">{c.total_chunks}</td>
                    <td className="mono whitespace-nowrap">
                      {c.scraped_at
                        ? new Date(c.scraped_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <a
                        href={c.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#b45309] underline underline-offset-4 hover:text-[#92400e]"
                      >
                        Open
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
