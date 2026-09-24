import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui';
import { CatalogGrid } from '@/components/test-series/CatalogGrid';
import { getCurrentUser } from '@/lib/server/session';
import { listPublished } from '@/lib/server/services/testSeriesService';

export const metadata: Metadata = {
  title: 'Test Series — Nursing Level Up',
  description: 'Timed, exam-level MCQ tests with explained answers. Start free, unlock full series when ready.',
};
export const dynamic = 'force-dynamic';

export default async function TestSeriesPage() {
  const series = await listPublished(await getCurrentUser());
  const free = series.filter((s) => s.is_free);
  const paid = series.filter((s) => !s.is_free);

  const totalQuestions = series.reduce((acc, s) => acc + (s.question_count || 0), 0);
  const totalDuration = series.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

  return (
    <div className="relative min-h-screen bg-paper overflow-hidden">
      {/* ── Background Subtle Depth ── */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {/* Subtle radial teal glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-full max-w-5xl opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(31, 122, 115, 0.12), transparent 75%)',
          }}
        />
        {/* Faint subtle grid */}
        <div className="absolute inset-x-0 top-0 h-96 opacity-[0.35] hero-grid" />
      </div>

      <div className="relative z-10">
        {/* ── Page header ── */}
        <header className="border-b border-line/60 bg-surface/30 backdrop-blur-xs">
          <div className="catalog-container py-10 sm:py-14 lg:py-16">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">

              {/* Left Column: Heading & Description */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600">
                  <span className="h-px w-5 bg-brand-500/70" />
                  Catalog
                </div>
                <h1 className="mt-3 font-serif text-4xl font-semibold leading-[1.12] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
                  Test series
                </h1>
                <p className="mt-3.5 max-w-xl text-[1rem] sm:text-[1.05rem] leading-relaxed text-muted">
                  Timed, exam-level MCQ tests with explained answers. Start free, unlock full series when you&apos;re ready.
                </p>

                {/* Small Quick Stats Pill Row */}
                <div className="mt-7 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-ink-2">
                  <div className="flex items-center gap-2 rounded-xl border border-line/80 bg-surface/80 px-3.5 py-2 shadow-2xs">
                    <span className="flex size-2 rounded-full bg-ok" />
                    <span className="font-semibold text-ink">{free.length}</span>
                    <span className="text-muted">Free Series</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-line/80 bg-surface/80 px-3.5 py-2 shadow-2xs">
                    <span className="flex size-2 rounded-full bg-amber-500" />
                    <span className="font-semibold text-ink">{paid.length}</span>
                    <span className="text-muted">Full Series</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-line/80 bg-surface/80 px-3.5 py-2 shadow-2xs">
                    <span className="flex size-2 rounded-full bg-brand-500" />
                    <span className="font-semibold text-ink">{totalQuestions > 0 ? `${totalQuestions}+` : '100+'}</span>
                    <span className="text-muted">Questions</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Compact Catalog Overview Card */}
              <div className="lg:col-span-5">
                <div className="relative overflow-hidden rounded-2xl border border-line/80 bg-surface/95 p-6 shadow-sm backdrop-blur-sm">
                  {/* Subtle decorative background lines / medical cross */}
                  <div className="pointer-events-none absolute -right-6 -top-6 text-brand-500/5" aria-hidden="true">
                    <svg className="size-40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11 2a2 2 0 0 0-2 2v2H7a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2V4a2 2 0 0 0-2-2h-2z" />
                    </svg>
                  </div>
                  <div className="pointer-events-none absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-brand-500/20 via-brand-500/50 to-transparent" aria-hidden="true" />

                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-line/60 pb-3.5">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6" />
                          <path d="M16 13H8" />
                          <path d="M16 17H8" />
                          <path d="M10 9H8" />
                        </svg>
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-800">
                        Test Series Overview
                      </span>
                    </div>
                    <span className="rounded-md bg-paper px-2 py-0.5 text-[10px] font-semibold text-muted ring-1 ring-line">
                      Catalog Summary
                    </span>
                  </div>

                  {/* 3 Metric rows / chips */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-paper/70 p-3 text-center ring-1 ring-line/60">
                      <div className="font-serif text-xl font-bold tracking-tight text-ink">
                        {series.length}+
                      </div>
                      <div className="mt-0.5 text-[11px] font-medium text-muted">
                        Practice Tests
                      </div>
                    </div>

                    <div className="rounded-xl bg-paper/70 p-3 text-center ring-1 ring-line/60">
                      <div className="font-serif text-xl font-bold tracking-tight text-ink">
                        {totalQuestions > 0 ? `${totalQuestions}+` : '100+'}
                      </div>
                      <div className="mt-0.5 text-[11px] font-medium text-muted">
                        Questions
                      </div>
                    </div>

                    <div className="rounded-xl bg-paper/70 p-3 text-center ring-1 ring-line/60">
                      <div className="font-serif text-xl font-bold tracking-tight text-brand-700">
                        Timed
                      </div>
                      <div className="mt-0.5 text-[11px] font-medium text-muted">
                        MCQ Format
                      </div>
                    </div>
                  </div>

                  {/* Mini feature checkmarks */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
                    <span className="flex items-center gap-1.5">
                      <svg className="size-3.5 text-brand-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                      Instant scoring
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="size-3.5 text-brand-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                      Full rationales
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="size-3.5 text-brand-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                      Subject-wise
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* ── Main Catalog Content ── */}
        <main className="catalog-container py-10 sm:py-14">
          {series.length === 0 ? (
            <EmptyState
              title="No test series published yet"
              description="Please check back soon — new series are added regularly."
            />
          ) : (
            <CatalogGrid free={free} paid={paid} />
          )}
        </main>
      </div>
    </div>
  );
}
