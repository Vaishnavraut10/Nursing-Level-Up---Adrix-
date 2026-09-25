'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card, Textarea, cx } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';
import type { QuestionInput } from '@/lib/validation';
import { QuestionEditor } from '../QuestionEditor';

interface ParseResponse {
  filename: string;
  format: string;
  questions: QuestionInput[];
  issues: { index: number; message: string; excerpt: string }[];
}

const EXAMPLE_TEMPLATE = `1. Normal adult respiratory rate is:
A) 6–10 /min
B) 12–20 /min
C) 22–28 /min
D) 30–40 /min
Answer: B
Explanation: Adults breathe 12–20 times per minute at rest.

2. Which vitamin is known as the sunshine vitamin?
A) Vitamin A
B) Vitamin B12
C) Vitamin C
D) Vitamin D
Answer: D
Explanation: Vitamin D is commonly produced in the skin after sunlight exposure.`;

const PLACEHOLDER_TEXT = `Paste your questions here...

Example:

1. Normal adult respiratory rate is:
A) 6–10 /min
B) 12–20 /min
C) 22–28 /min
D) 30–40 /min
Answer: B
Explanation: Adults breathe 12–20 times per minute at rest.

2. Your next question here:
A) Option A
B) Option B
C) Option C
D) Option D
Answer: A
Explanation: Explanation here.`;

/**
 * Upload → server parse → validate → PREVIEW → admin edits → save (PRD §6.9). The file is parsed on the
 * server; the preview shows extracted plain text only, never the uploaded HTML.
 */
export function StructuredImport({ seriesId }: { seriesId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<'file' | 'paste'>('paste');
  const [file, setFile] = useState<File | null>(null);
  const [pasted, setPasted] = useState('');
  const [result, setResult] = useState<ParseResponse | null>(null);
  const [items, setItems] = useState<QuestionInput[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [busy, setBusy] = useState<'parse' | 'save' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const detectedQuestions = (pasted.match(/^(?:Q(?:uestion)?\s*)?\d{1,4}\s*[.):\-]/gm) || []).length;

  function handleCopyExample() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(EXAMPLE_TEMPLATE).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClear() {
    setPasted('');
    setResult(null);
    setItems([]);
    setError(null);
  }

  async function parse() {
    setError(null);
    setBusy('parse');
    try {
      let res: ParseResponse;
      if (mode === 'file') {
        if (!file) throw new Error('Choose a file first');
        const form = new FormData();
        form.append('file', file);
        res = await api<ParseResponse>(`/api/admin/test-series/${seriesId}/import/html`, { method: 'POST', body: form });
      } else {
        if (!pasted.trim()) throw new Error('Please paste some question text first');
        res = await api<ParseResponse>(`/api/admin/test-series/${seriesId}/import/html`, { method: 'POST', json: { html: pasted } });
      }
      setResult(res);
      setItems(res.questions);
      setEditing(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    setBusy('save');
    setError(null);
    try {
      await api(`/api/admin/test-series/${seriesId}/import/save`, { method: 'POST', json: { questions: items, filename: result?.filename } });
      router.push(`/admin/test-series/${seriesId}/questions`);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(null);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="font-sans text-base font-semibold">Structured import</h2>
      <p className="mt-1 text-sm text-muted">
        HTML, CSV, JSON or text files that already contain questions with answers. Supports numbered text
        (“1. … A) … Answer: B”), HTML tables with Question/A/B/C/D/Answer columns, <code className="text-xs">.question</code>/<code className="text-xs">.option</code> markup,
        and CSV/JSON with <code className="text-xs">question, option_a…option_d, correct_answer, explanation</code>.
      </p>

      {!result && (
        <div className="mt-5 space-y-4">
          <div className="inline-flex rounded-lg border border-line bg-sunken p-0.5 text-sm">
            {(['file', 'paste'] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)} className={cx('rounded-md px-3 py-1.5 font-medium transition-all', mode === m ? 'bg-surface shadow-sm text-ink' : 'text-muted')}>
                {m === 'file' ? 'Upload file' : 'Paste text / HTML'}
              </button>
            ))}
          </div>
          {mode === 'file' ? (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-line-strong bg-paper px-6 py-8 text-center hover:border-brand-500 transition-colors">
              <span className="text-sm font-medium text-ink">{file ? file.name : 'Choose a .html, .csv, .json or .txt file'}</span>
              <span className="mt-1 text-xs text-muted">Max 2 MB</span>
              <input type="file" accept=".html,.htm,.csv,.json,.txt" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} data-testid="structured-file" />
            </label>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Paste your questions below:
                </span>
                <span className="text-xs text-muted">
                  Formatting & newlines preserved
                </span>
              </div>
              <textarea
                rows={14}
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                placeholder={PLACEHOLDER_TEXT}
                aria-label="Paste questions"
                className="w-full min-h-[350px] rounded-xl border border-line bg-paper p-4 font-mono text-xs sm:text-sm leading-relaxed text-ink placeholder:text-muted/60 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all resize-y shadow-2xs"
              />
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted pt-0.5">
                <div className="flex items-center gap-2 font-medium">
                  <span>Characters: <strong className="text-ink">{pasted.length.toLocaleString()}</strong></span>
                  <span className="text-line-strong">•</span>
                  <span>Questions detected: <strong className="text-brand-700 font-bold">{detectedQuestions}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyExample}
                    className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:border-line-strong hover:bg-sunken transition-colors"
                  >
                    <svg className="size-3.5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    {copied ? 'Copied!' : 'Copy example'}
                  </button>
                  {pasted.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                    >
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          {error && <Alert>{error}</Alert>}
          <Button onClick={parse} loading={busy === 'parse'} disabled={mode === 'file' ? !file : !pasted.trim()}>Parse and preview</Button>
        </div>
      )}

      {result && (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-sunken px-4 py-3 text-sm">
            <span>
              <strong>{items.length}</strong> question{items.length === 1 ? '' : 's'} ready from <em>{result.filename}</em>
              {result.issues.length > 0 && <span className="text-bad"> · {result.issues.length} skipped</span>}
            </span>
            <Button size="sm" variant="ghost" onClick={() => { setResult(null); setItems([]); }}>Start over</Button>
          </div>
          {result.issues.length > 0 && (
            <Alert tone="warn" title="Some entries could not be imported">
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {result.issues.slice(0, 10).map((i) => <li key={i.index}>#{i.index}: {i.message}{i.excerpt && ` — “${i.excerpt}”`}</li>)}
                {result.issues.length > 10 && <li>…and {result.issues.length - 10} more</li>}
              </ul>
            </Alert>
          )}
          <ol className="space-y-2">
            {items.map((q, i) => (
              <li key={i} className="rounded-lg border border-line p-4">
                {editing === i ? (
                  <QuestionEditor idPrefix={`imp-${i}`} initial={q} saveLabel="Update" onCancel={() => setEditing(null)}
                    onSave={(updated) => { setItems((all) => all.map((x, j) => (j === i ? updated : x))); setEditing(null); }} />
                ) : (
                  <div className="flex gap-3 text-sm">
                    <span className="font-semibold text-muted">{i + 1}.</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink">{q.question_text}</p>
                      <p className="mt-1 text-xs text-muted">
                        {(['A', 'B', 'C', 'D'] as const).map((l) => `${l}) ${q[`option_${l.toLowerCase()}` as 'option_a']}`).join('   ')}
                      </p>
                      <p className="mt-1 text-xs font-medium text-ok">Answer: {q.correct_answer}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(i)}>Edit</Button>
                      <Button size="sm" variant="ghost" className="text-bad" onClick={() => setItems((all) => all.filter((_, j) => j !== i))}>Remove</Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
          {error && <Alert>{error}</Alert>}
          <div className="flex justify-end">
            <Button onClick={save} loading={busy === 'save'} disabled={items.length === 0} data-testid="save-import">
              Save {items.length} question{items.length === 1 ? '' : 's'} to test series
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
