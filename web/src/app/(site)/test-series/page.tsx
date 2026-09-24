import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink, EmptyState } from '@/components/ui';
import { CatalogGrid } from '@/components/test-series/CatalogGrid';
import { getCurrentUser } from '@/lib/server/session';
import { listPublished } from '@/lib/server/services/testSeriesService';
import { getPublishedCourse, hasCoursePurchase } from '@/lib/server/services/courseService';

export const metadata: Metadata = {
  title: 'Test Series — Nursing Level Up',
  description: 'Timed, exam-level MCQ tests with explained answers. Start free, unlock full series when ready.',
};
export const dynamic = 'force-dynamic';

export default async function TestSeriesPage() {
  const user = await getCurrentUser();
  const [series, course] = await Promise.all([
    listPublished(user),
    getPublishedCourse(),
  ]);
  const hasCourse = course && user ? await hasCoursePurchase(user.id, course.id) : false;

  const free = series.filter((s) => s.is_free);
  const paid = series.filter((s) => !s.is_free);

  const totalQuestions = series.reduce((acc, s) => acc + (s.question_count || 0), 0);

  return (
    <div className="relative min-h-screen bg-paper overflow-hidden">
      {/* ── Background Subtle Depth ── */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-full max-w-5xl opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(31, 122, 115, 0.12), transparent 75%)',
          }}
        />
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
                  Nursing Exam Preparation
                </div>
                <h1 className="mt-3 font-serif text-4xl font-semibold leading-[1.12] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
                  Test series
                </h1>
                <p className="mt-3.5 max-w-xl text-[1rem] sm:text-[1.05rem] leading-relaxed text-muted">
                  Up to 200+ timed, exam-level MCQ tests with explained answers. Start with free series or unlock the complete course for daily daily releases.
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
                    <span className="font-semibold text-ink">{paid.length > 0 ? paid.length : '200+'}</span>
                    <span className="text-muted">Course Series</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-line/80 bg-surface/80 px-3.5 py-2 shadow-2xs">
                    <span className="flex size-2 rounded-full bg-brand-500" />
                    <span className="font-semibold text-ink">{totalQuestions > 0 ? `${totalQuestions}+` : '100+'}</span>
                    <span className="text-muted">Questions</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Course Pass CTA Card */}
              <div className="lg:col-span-5">
                <div className="relative overflow-hidden rounded-2xl border border-line/80 bg-surface/95 p-6 shadow-sm backdrop-blur-sm">
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
                        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-800">
                        Complete Course Pass
                      </span>
                    </div>
                    {hasCourse ? (
                      <span className="rounded-full bg-ok-50 px-2.5 py-0.5 text-[11px] font-semibold text-ok ring-1 ring-ok/20">
                        Enrolled ✓
                      </span>
                    ) : course?.promo_code ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200/60">
                        Promo: {course.promo_code}
                      </span>
                    ) : null}
                  </div>

                  {hasCourse ? (
                    <div className="mt-4 space-y-3">
                      <p className="text-xs text-muted leading-relaxed">
                        Your Course Pass is active! Test series release daily at <strong className="text-ink">5:00 PM IST</strong> based on your enrollment date.
                      </p>
                      <div className="rounded-xl bg-paper/70 p-3 text-xs text-ink-2 ring-1 ring-line/60 flex items-center justify-between">
                        <span>Daily Drip Schedule</span>
                        <span className="font-semibold text-brand-700">5:00 PM IST Daily</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="font-serif text-2xl font-bold text-ink">₹{course?.price ?? 299}</div>
                          {course?.promo_code && course?.discount_price && (
                            <div className="text-[11px] text-muted">
                              ₹{course.discount_price} with code <strong className="text-brand-700 font-semibold">{course.promo_code}</strong>
                            </div>
                          )}
                        </div>
                        <ButtonLink href="/course" size="sm" className="rounded-xl">
                          Enroll Now →
                        </ButtonLink>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">
                        One single purchase unlocks all 200+ test series. Day 1 test available immediately, with new tests unlocking daily at 5:00 PM IST.
                      </p>
                    </div>
                  )}

                  {/* Feature checkmarks */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted border-t border-line/60 pt-3">
                    <span className="flex items-center gap-1.5">
                      <svg className="size-3.5 text-brand-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                      Up to 200+ series
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="size-3.5 text-brand-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                      5 PM IST Releases
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="size-3.5 text-brand-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                      Rationales & Keys
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
