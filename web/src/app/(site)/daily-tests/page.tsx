import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink, Card, Container, Badge } from '@/components/ui';
import { getCurrentUser } from '@/lib/server/session';
import { listPublished, getTodayPublished } from '@/lib/server/services/dailyTestService';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Daily Test Series — Nursing Level Up',
  description: 'Practice daily nursing exam questions and test your preparation consistency.',
};

export const dynamic = 'force-dynamic';

export default async function DailyTestsPage() {
  const user = await getCurrentUser();
  const [todayTest, allPublished] = await Promise.all([
    getTodayPublished(user),
    listPublished(user),
  ]);

  // Filter out today's test from the archive list so it's not duplicated
  const previousTests = allPublished.filter((t) => t.is_past);

  return (
    <div className="min-h-screen bg-paper pb-16">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden border-b border-line/60 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 py-12 sm:py-16 text-white">
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-20" />
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-brand-500/20 blur-3xl" />
        <Container className="relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-brand-100 backdrop-blur-sm">
              <span className="size-2 rounded-full bg-ok animate-pulse" />
              Daily Practice Series
            </div>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Daily Nursing Test Series
            </h1>
            <p className="mt-3 text-lg text-brand-100/80">
              Fresh set of nursing exam practice questions published every day. Test your knowledge, track accuracy, and stay consistent.
            </p>
          </div>
        </Container>
      </div>

      <Container className="mt-10 space-y-12">
        {/* ── Today's Test ── */}
        <section aria-labelledby="todays-test-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="todays-test-heading" className="font-serif text-2xl font-semibold text-ink">
              Today&apos;s Test
            </h2>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {todayTest ? (
            <Card className="overflow-hidden border-2 border-brand-200 bg-gradient-to-br from-brand-50/50 via-surface to-surface p-6 shadow-md transition-all hover:shadow-lg sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge tone="brand">{todayTest.category || 'Nursing'}</Badge>
                    <span className="text-muted">•</span>
                    <span className="font-medium text-ink-2">{todayTest.question_count} Questions</span>
                    <span className="text-muted">•</span>
                    <span className="font-medium text-ink-2">{todayTest.duration_minutes} Minutes</span>
                    <span className="text-muted">•</span>
                    <span className="font-medium text-brand-700">{todayTest.total_marks} Marks</span>
                  </div>

                  <h3 className="font-serif text-2xl font-semibold text-ink">
                    {todayTest.title}
                  </h3>

                  {todayTest.description && (
                    <p className="text-sm text-muted max-w-2xl">{todayTest.description}</p>
                  )}
                </div>

                <div className="shrink-0">
                  {todayTest.user_attempt?.status === 'COMPLETED' ? (
                    <div className="flex flex-col items-start gap-2 lg:items-end">
                      <div className="text-xs font-medium text-ok bg-ok-50 border border-ok/20 rounded-full px-3 py-1">
                        Completed • Score: {todayTest.user_attempt.score}/{todayTest.user_attempt.total_marks} ({todayTest.user_attempt.percentage}%)
                      </div>
                      <ButtonLink
                        href={`/daily-tests/results/${todayTest.user_attempt.id}`}
                        size="lg"
                        className="rounded-full px-8 shadow-sm"
                      >
                        View Result →
                      </ButtonLink>
                    </div>
                  ) : todayTest.user_attempt?.status === 'IN_PROGRESS' ? (
                    <ButtonLink
                      href={`/daily-tests/${todayTest.id}`}
                      size="lg"
                      className="rounded-full px-8 shadow-md"
                    >
                      Resume Test →
                    </ButtonLink>
                  ) : (
                    <ButtonLink
                      href={`/daily-tests/${todayTest.id}`}
                      size="lg"
                      className="rounded-full px-8 shadow-md"
                    >
                      Start Test →
                    </ButtonLink>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-line">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-sunken text-muted">
                <svg className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-4 font-serif text-xl font-semibold text-ink">No daily test available today.</h3>
              <p className="mt-1.5 max-w-sm text-sm text-muted">
                Today&apos;s daily test hasn&apos;t been published yet. Please check back later or explore previous tests below.
              </p>
            </Card>
          )}
        </section>

        {/* ── Previous Tests Archive ── */}
        <section aria-labelledby="previous-tests-heading">
          <div className="mb-4">
            <h2 id="previous-tests-heading" className="font-serif text-2xl font-semibold text-ink">
              Previous Tests
            </h2>
            <p className="mt-1 text-sm text-muted">
              Access all past published daily tests for practice and review.
            </p>
          </div>

          {previousTests.length === 0 ? (
            <Card className="p-8 text-center text-muted">
              No previous daily tests available in the archive.
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {previousTests.map((test) => (
                <Card key={test.id} className="card-hover flex flex-col justify-between p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="font-medium text-brand-600">{formatDate(test.test_date)}</span>
                      <span className="rounded bg-sunken px-2 py-0.5 font-medium text-ink-2">{test.category || 'Nursing'}</span>
                    </div>

                    <h3 className="font-serif text-lg font-semibold text-ink line-clamp-2">
                      {test.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span>{test.question_count} Questions</span>
                      <span>•</span>
                      <span>{test.duration_minutes} Mins</span>
                      <span>•</span>
                      <span>{test.total_marks} Marks</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-line/60">
                    {test.user_attempt?.status === 'COMPLETED' ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-ok">
                          Score: {test.user_attempt.score}/{test.user_attempt.total_marks}
                        </span>
                        <Link
                          href={`/daily-tests/results/${test.user_attempt.id}`}
                          className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                        >
                          View Result →
                        </Link>
                      </div>
                    ) : test.user_attempt?.status === 'IN_PROGRESS' ? (
                      <ButtonLink
                        href={`/daily-tests/${test.id}`}
                        size="sm"
                        variant="secondary"
                        className="w-full justify-center"
                      >
                        Resume →
                      </ButtonLink>
                    ) : (
                      <ButtonLink
                        href={`/daily-tests/${test.id}`}
                        size="sm"
                        variant="secondary"
                        className="w-full justify-center"
                      >
                        Start Test →
                      </ButtonLink>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}
