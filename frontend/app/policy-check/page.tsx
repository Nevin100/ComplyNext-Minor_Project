/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
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
import { UploadCloud, FileText } from "lucide-react";

interface PolicyDoc {
  id: number;
  filename: string;
  uploaded_at: string;
  analyzed: boolean;
}

interface Gap {
  id: number;
  clause_text: string;
  verdict: string;
  explanation: string;
  cited_passages: string | null;
}

export default function PolicyCheckPage() {
  const [docs, setDocs] = useState<PolicyDoc[]>([]);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    try {
      const res = await api.get("/api/policy/documents");
      setDocs(res.data ?? []);
    } catch {
      setError("Could not load policy documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setOk("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/api/policy/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setOk(`Uploaded ${res.data?.filename ?? file.name}.`);
      fetchDocs();
    } catch {
      setError("Upload failed. Only .txt and .pdf are supported.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleAnalyze = async (id: number) => {
    setError("");
    setOk("");
    setAnalyzing(true);
    try {
      const res = await api.post(`/api/policy/analyze/${id}`);
      setSelected(id);
      setGaps(res.data?.gaps ?? []);
      setOk("Analysis complete.");
      fetchDocs();
    } catch {
      setError("Analysis failed. Check the backend and Groq key.");
    } finally {
      setAnalyzing(false);
    }
  };

  const viewGaps = async (id: number) => {
    setError("");
    setSelected(id);
    try {
      const res = await api.get(`/api/policy/gaps?document_id=${id}`);
      setGaps(res.data?.gaps ?? []);
    } catch {
      setError("Could not load findings.");
    }
  };

  if (loading) return <Spinner label="Loading policies…" />;

  const gapCount = gaps.filter((g) => g.verdict === "GAP").length;

  return (
    <>
      <PageHeader
        eyebrow="Agentic review"
        title="Policy gap check"
        desc="Upload an internal policy (.txt/.pdf). Three LangGraph agents retrieve the relevant RBI passages, compare each clause, and explain the verdict with citations."
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

      {/* upload */}
      <Card className="mb-6">
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.pdf"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[#e7e0d5] px-6 py-10 transition-colors hover:border-[#b45309] hover:bg-[#fef3e2]/40 disabled:opacity-50"
        >
          <UploadCloud className="h-8 w-8 text-[#b45309]" />
          <span className="font-medium">
            {uploading ? "Uploading…" : "Drop a policy document, or click to browse"}
          </span>
          <span className="mono text-xs text-[#a8a29e]">
            .txt · .pdf · one policy per file
          </span>
        </button>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* document list */}
        <Card className="lg:col-span-1">
          <h2 className="font-display mb-4 text-xl">Documents</h2>
          {docs.length === 0 ? (
            <EmptyState
              title="No policies yet"
              desc="Upload your first policy document above."
            />
          ) : (
            <div className="space-y-2">
              {docs.map((d) => (
                <button
                  key={d.id}
                  onClick={() =>
                    d.analyzed ? viewGaps(d.id) : handleAnalyze(d.id)
                  }
                  disabled={analyzing}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    selected === d.id
                      ? "border-[#b45309] bg-[#fef3e2]/50"
                      : "border-[#e7e0d5] hover:border-[#a8a29e]"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#b45309]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {d.filename}
                      </p>
                      <p className="mono mt-1 text-[11px] text-[#a8a29e]">
                        {new Date(d.uploaded_at).toLocaleDateString()} ·{" "}
                        {d.analyzed ? "analyzed" : "not analyzed"}
                      </p>
                    </div>
                  </div>
                  <span className="mono mt-2 block text-xs text-[#b45309]">
                    {analyzing && selected === d.id
                      ? "analyzing…"
                      : d.analyzed
                        ? "view findings →"
                        : "run analysis →"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* findings */}
        <div className="lg:col-span-2">
          {selected === null ? (
            <EmptyState
              title="Select a document"
              desc="Pick a policy to run the agents, or view its existing findings."
            />
          ) : gaps.length === 0 ? (
            <EmptyState
              title={analyzing ? "Agents are working…" : "No findings"}
              desc={
                analyzing
                  ? "Retriever → comparer → explainer. This takes a moment."
                  : "This policy has no analyzed findings yet."
              }
            />
          ) : (
            <>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="font-display text-2xl">Findings</h2>
                <Pill value={gapCount > 0 ? "GAP" : "COMPLIANT"} />
                <span className="mono text-xs text-[#a8a29e]">
                  {gapCount} gap{gapCount === 1 ? "" : "s"} ·{" "}
                  {gaps.length - gapCount} compliant
                </span>
              </div>
              <div className="space-y-4">
                {gaps.map((g) => (
                  <Card
                    key={g.id}
                    className={
                      g.verdict === "GAP"
                        ? "border-l-4 !border-l-[#b91c1c]"
                        : "border-l-4 !border-l-[#047857]"
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Pill value={g.verdict} />
                      <p className="mono text-xs text-[#a8a29e]">
                        finding #{g.id}
                      </p>
                    </div>
                    <blockquote className="mt-3 border-l-2 border-[#e7e0d5] pl-3 text-sm italic text-[#57534e]">
                      “{g.clause_text}”
                    </blockquote>
                    <p className="mt-3 text-sm leading-relaxed">
                      {g.explanation}
                    </p>
                    {g.cited_passages && (
                      <details className="mt-3">
                        <summary className="mono cursor-pointer text-xs text-[#b45309]">
                          cited RBI passages
                        </summary>
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-[#78716c]">
                          {g.cited_passages}
                        </p>
                      </details>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
