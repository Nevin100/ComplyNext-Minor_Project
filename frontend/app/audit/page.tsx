/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Card,
  PageHeader,
  Pill,
  Spinner,
  EmptyState,
  ErrorBox,
  OkBox,
} from "@/components/ui";
import { Download } from "lucide-react";

interface AuditLog {
  id: number;
  action: string;
  entity: string | null;
  entity_id: number | null;
  detail: string | null;
  created_at: string;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [exporting, setExporting] = useState(false);
  const LIMIT = 25;

  const fetchLogs = async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/audit/logs?limit=${LIMIT}&offset=${p * LIMIT}`
      );
      setLogs(res.data?.logs ?? []);
      setTotal(res.data?.total ?? 0);
    } catch {
      setError("Could not load the audit trail.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const handleExport = async () => {
    setError("");
    setOk("");
    setExporting(true);
    try {
      const res = await api.get("/api/audit/export", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "complynext-audit-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setOk("Audit report downloaded.");
    } catch {
      setError("PDF export failed.");
    } finally {
      setExporting(false);
    }
  };

  if (loading && logs.length === 0) return <Spinner label="Loading audit trail…" />;

  const pages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <>
      <PageHeader
        eyebrow="Accountability"
        title="Audit trail"
        desc="Every classification, analysis and scrape — timestamped, attributed to your institution, and exportable as a formal PDF."
        actions={
          <button
            onClick={handleExport}
            disabled={exporting || total === 0}
            className="btn-primary"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exporting…" : "Export PDF"}
          </button>
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

      {logs.length === 0 ? (
        <EmptyState
          title="Trail is empty"
          desc="Actions you take — classifications, policy analyses, scrapes — will appear here."
        />
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td className="mono whitespace-nowrap">
                        {new Date(l.created_at).toLocaleString()}
                      </td>
                      <td>
                        <Pill value={l.action} />
                      </td>
                      <td className="mono whitespace-nowrap">
                        {l.entity
                          ? `${l.entity}${l.entity_id ? ` #${l.entity_id}` : ""}`
                          : "—"}
                      </td>
                      <td className="max-w-[300px] truncate text-[#78716c]">
                        {l.detail ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="mt-4 flex items-center justify-between">
            <p className="mono text-xs text-[#a8a29e]">
              page {page + 1} of {pages} · {total} entries
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-ghost"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                disabled={page >= pages - 1}
                className="btn-ghost"
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
