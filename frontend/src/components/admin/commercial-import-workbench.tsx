'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Sparkles,
  Upload
} from '@/components/icons';

import {
  buildCommercialImportErrorCsv,
  buildCommercialImportFormData,
  COMMERCIAL_IMPORT_COLLECTION_META,
  COMMERCIAL_IMPORT_COLLECTIONS,
  type CommercialImportCollection,
  type CommercialImportMode,
  type CommercialImportSummary
} from '@/lib/commercial-import';
import { cn } from '@/lib/utils';

type ImportState = {
  loading: CommercialImportMode | null;
  error: string | null;
  result: CommercialImportSummary | null;
};

const DEFAULT_COLLECTION: CommercialImportCollection = 'customers';

function downloadCsv(filename: string, csvText: string) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function actionStyles(action: CommercialImportSummary['rows'][number]['action']) {
  switch (action) {
    case 'created':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
    case 'updated':
      return 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300';
    case 'skipped':
      return 'border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300';
    case 'failed':
      return 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300';
  }
}

export function CommercialImportWorkbench() {
  const [collection, setCollection] = useState<CommercialImportCollection>(DEFAULT_COLLECTION);
  const [csvText, setCsvText] = useState(
    COMMERCIAL_IMPORT_COLLECTION_META[DEFAULT_COLLECTION].sampleCsv
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [allowPartial, setAllowPartial] = useState(false);
  const [state, setState] = useState<ImportState>({ loading: null, error: null, result: null });

  const meta = COMMERCIAL_IMPORT_COLLECTION_META[collection];
  const canSubmit = csvText.trim().length > 0;
  const summary = state.result?.counts ?? { created: 0, updated: 0, skipped: 0, failed: 0 };
  const errorRows = state.result?.errorRows ?? [];

  useEffect(() => {
    setState({ loading: null, error: null, result: null });
    setSelectedFile(null);
    setCsvText(meta.sampleCsv);
  }, [meta.sampleCsv]);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      setCsvText(text);
      setState((current) => ({ ...current, error: null }));
    } catch {
      setState((current) => ({
        ...current,
        error: 'Failed to read the selected CSV file.'
      }));
    }
  }

  async function runImport(mode: CommercialImportMode) {
    if (!canSubmit) {
      setState({
        loading: null,
        error: 'Paste CSV text or choose a file before running the import.',
        result: null
      });
      return;
    }

    setState({ loading: mode, error: null, result: null });

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        credentials: 'include',
        body: buildCommercialImportFormData(
          {
            collection,
            csvText,
            allowPartial,
            mode
          },
          selectedFile
        )
      });

      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        data?: CommercialImportSummary;
        error?: { message?: string };
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? 'Commercial import failed.');
      }

      const result = payload?.data ?? null;
      if (!result) {
        throw new Error('Commercial import returned an empty payload.');
      }

      setState({ loading: null, error: null, result });
    } catch (error) {
      setState({
        loading: null,
        error: error instanceof Error ? error.message : 'Commercial import failed.',
        result: null
      });
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runImport('preview');
  }

  function onDownloadErrors() {
    if (errorRows.length === 0) {
      return;
    }

    downloadCsv('commercial-import-errors.csv', buildCommercialImportErrorCsv(errorRows));
  }

  const rowLabel = useMemo(() => {
    if (!state.result) {
      return 'No run yet';
    }

    if (state.result.mode === 'commit' && state.result.committed) {
      return 'Commit completed';
    }

    if (state.result.aborted) {
      return 'Commit aborted';
    }

    return state.result.mode === 'preview' ? 'Preview ready' : 'Commit ready';
  }, [state.result]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur">
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border-b border-border/70 bg-gradient-to-br from-brand/10 via-background to-background px-6 py-6 sm:px-8 sm:py-8 lg:border-b-0 lg:border-r">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Sales Ops only
          </div>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Commercial import workbench
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Preview or commit CSV rows against Directus through the `/api/import` facade. Customers
            can fall back to tax code or email, while orders use atomic nested `order_items_json`.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {COMMERCIAL_IMPORT_COLLECTIONS.map((item) => {
              const itemMeta = COMMERCIAL_IMPORT_COLLECTION_META[item];
              const active = item === collection;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCollection(item)}
                  className={cn(
                    'rounded-2xl border px-4 py-4 text-left transition-colors',
                    active
                      ? 'border-brand/40 bg-brand/10 shadow-sm'
                      : 'border-border/70 bg-background/60 hover:border-brand/30 hover:bg-background'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{itemMeta.label}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {itemMeta.description}
                      </p>
                    </div>
                    {active && (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand" aria-hidden="true" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-border/70 bg-background/80 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="h-4 w-4 text-brand" aria-hidden="true" />
              Required keys
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{meta.keyHint}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {meta.requiredColumns.map((column) => (
                <span
                  key={column}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
                >
                  {column}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Created', value: summary.created },
              { label: 'Updated', value: summary.updated },
              { label: 'Failed', value: summary.failed }
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-border/70 bg-background/75 px-4 py-4"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8 sm:py-8">
          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-foreground"
                htmlFor="commercial-import-file"
              >
                CSV file or pasted text
              </label>
              <label
                htmlFor="commercial-import-file"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-background/70 px-6 py-8 text-center transition-colors hover:border-brand/40 hover:bg-brand/5"
              >
                <Upload className="h-5 w-5 text-brand" aria-hidden="true" />
                <span className="mt-2 text-sm font-medium text-foreground">
                  Drop a CSV file or click to upload
                </span>
                <span className="mt-1 text-xs leading-5 text-muted-foreground">
                  The file will be read into the editor so you can review or tweak the payload
                  before previewing.
                </span>
                <input
                  id="commercial-import-file"
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={(event) => void onFileChange(event)}
                />
              </label>
              {selectedFile && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Loaded file:{' '}
                  <span className="font-medium text-foreground">{selectedFile.name}</span>
                </p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  className="block text-sm font-medium text-foreground"
                  htmlFor="commercial-import-csv"
                >
                  CSV content
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-brand hover:underline"
                  onClick={() => {
                    setSelectedFile(null);
                    setCsvText(meta.sampleCsv);
                  }}
                >
                  Load sample
                </button>
              </div>
              <textarea
                id="commercial-import-csv"
                value={csvText}
                onChange={(event) => setCsvText(event.target.value)}
                spellCheck={false}
                rows={12}
                className="w-full rounded-2xl border border-border/80 bg-background/80 px-4 py-3 font-mono text-xs leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder={meta.sampleCsv}
              />
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-4">
              <input
                type="checkbox"
                checked={allowPartial}
                onChange={(event) => setAllowPartial(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border text-brand focus:ring-brand"
              />
              <span>
                <span className="block text-sm font-medium text-foreground">
                  Allow partial success
                </span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  Keep valid rows and report failures instead of aborting the whole file.
                </span>
              </span>
            </label>

            {state.error && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-4 text-sm text-rose-700 dark:text-rose-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p>{state.error}</p>
              </div>
            )}

            {state.result?.aborted && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-800 dark:text-amber-200">
                The commit was aborted because validation failed and partial success was disabled.
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={state.loading !== null || !canSubmit}
                className="inline-flex items-center gap-2 rounded-full border border-brand bg-brand px-5 py-3 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state.loading === 'preview' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Previewing
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    Preview
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => void runImport('commit')}
                disabled={state.loading !== null || !canSubmit}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state.loading === 'commit' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Committing
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Commit import
                  </>
                )}
              </button>
            </div>
          </form>

          {state.result && (
            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {rowLabel}
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {state.result.collection} · {state.result.mode} · partial success{' '}
                      {state.result.allowPartial ? 'on' : 'off'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onDownloadErrors}
                    disabled={errorRows.length === 0}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download errors
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-muted/60 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Row</th>
                      <th className="px-4 py-3 font-medium">Key</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                      <th className="px-4 py-3 font-medium">Errors</th>
                      <th className="px-4 py-3 font-medium">Nested</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {state.result.rows.map((row) => (
                      <tr key={`${row.row}-${row.key}`}>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {row.row}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-foreground">
                          {row.key || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                              actionStyles(row.action)
                            )}
                          >
                            {row.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {row.errors.length === 0
                            ? '—'
                            : row.errors.map((item) => `${item.field}: ${item.message}`).join('; ')}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {Array.isArray(row.nested?.order_items)
                            ? `${row.nested?.order_items.length ?? 0} order items`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {errorRows.length > 0 && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-4 text-sm text-rose-700 dark:text-rose-300">
                  <p className="font-medium">Validation errors</p>
                  <p className="mt-1 text-sm leading-6">
                    {errorRows.length} row-level error{errorRows.length === 1 ? '' : 's'} were
                    returned. Download the CSV to fix the source file and re-run the preview.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
