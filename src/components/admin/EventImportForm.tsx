"use client";

import { useState, useTransition } from "react";
import type { CsvParseResult } from "@/lib/events/import-csv";
import { CSV_COLUMNS, SAMPLE_CSV } from "@/lib/events/import-csv";
import {
  importEventsCsvAction,
  previewEventsCsvAction,
} from "@/app/admin/(dashboard)/events/import/actions";

interface EventImportFormProps {
  supabaseReady: boolean;
}

export function EventImportForm({ supabaseReady }: EventImportFormProps) {
  const [csv, setCsv] = useState("");
  const [upsert, setUpsert] = useState(true);
  const [preview, setPreview] = useState<CsvParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    imported: number;
    updated: number;
    skipped: number;
    failures: { line: number; message: string }[];
  } | null>(null);
  const [pending, startTransition] = useTransition();

  const runPreview = () => {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("csv", csv);
      const res = await previewEventsCsvAction(fd);
      if ("error" in res && res.error) {
        setError(res.error);
        setPreview(null);
        return;
      }
      if ("preview" in res && res.preview) setPreview(res.preview);
    });
  };

  const runImport = () => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("csv", csv);
      if (upsert) fd.set("upsert", "on");
      const res = await importEventsCsvAction(fd);
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      if ("success" in res && res.success) {
        setResult({
          imported: res.imported,
          updated: res.updated,
          skipped: res.skipped,
          failures: res.failures,
        });
        if (res.preview) setPreview(res.preview);
      }
    });
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setCsv(reader.result);
    };
    reader.readAsText(file);
  };

  if (!supabaseReady) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Connect Supabase to import events.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-card-border bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">CSV format</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Required columns: <strong>title</strong>, <strong>venue_slug</strong>,{" "}
          <strong>event_date</strong>. Use slugs for venue/competition/teams; use{" "}
          <code className="text-zinc-700">home_team_label</code> /{" "}
          <code className="text-zinc-700">away_team_label</code> for TBD knockout
          placeholders (e.g. W89, W90).
        </p>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-sky-600">
            Show all column names
          </summary>
          <p className="mt-2 font-mono text-xs text-zinc-600">{CSV_COLUMNS.join(", ")}</p>
        </details>

        <button
          type="button"
          onClick={() => setCsv(SAMPLE_CSV)}
          className="mt-4 text-sm font-semibold text-sky-600 hover:underline"
        >
          Load sample CSV (2 quarterfinals)
        </button>
      </section>

      <section className="rounded-xl border border-card-border bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Upload or paste</h2>

        <input
          type="file"
          accept=".csv,text/csv"
          className="mt-3 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-sky-700"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={12}
          placeholder="Paste CSV here…"
          className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
        />

        <label className="mt-4 flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={upsert}
            onChange={(e) => setUpsert(e.target.checked)}
            className="rounded border-slate-300"
          />
          Upsert by slug (update existing events with same slug)
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending || !csv.trim()}
            onClick={runPreview}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-slate-50 disabled:opacity-50"
          >
            Preview
          </button>
          <button
            type="button"
            disabled={pending || !csv.trim()}
            onClick={runImport}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
          >
            Import valid rows
          </button>
        </div>
      </section>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {result && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Imported <strong>{result.imported}</strong> event(s).
          {result.skipped > 0 && ` Skipped ${result.skipped} row(s).`}
          {result.failures.length > 0 && (
            <ul className="mt-2 list-inside list-disc">
              {result.failures.map((f) => (
                <li key={`${f.line}-${f.message}`}>
                  Line {f.line}: {f.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {preview && (
        <section className="rounded-xl border border-card-border bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Preview</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {preview.validCount} valid · {preview.errorCount} with errors ·{" "}
            {preview.rows.length} total rows
          </p>

          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-zinc-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Line</th>
                  <th className="px-3 py-2 font-medium">Slug</th>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Issues</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => (
                  <tr key={row.line} className="border-b border-slate-100 align-top">
                    <td className="px-3 py-2 tabular-nums">{row.line}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.slug ?? "—"}</td>
                    <td className="px-3 py-2">{row.values?.title ?? "—"}</td>
                    <td className="px-3 py-2">
                      {row.errors.length === 0 ? (
                        <span className="text-emerald-700">OK</span>
                      ) : (
                        <span className="text-red-600">Error</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {row.errors.map((e) => (
                        <p key={e} className="text-red-600">
                          {e}
                        </p>
                      ))}
                      {row.warnings.map((w) => (
                        <p key={w} className="text-amber-700">
                          {w}
                        </p>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
