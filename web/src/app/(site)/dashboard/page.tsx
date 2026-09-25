import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink, Card, Container, EmptyState, StatusBadge } from '@/components/ui';
import { requireStudentPage } from '@/lib/server/session';
import { listForUser as listAttempts, progressForUser } from '@/lib/server/services/attemptService';
import { listForUser as listPurchases } from '@/lib/server/services/purchaseService';
import { formatDate, formatDuration, formatMoney, formatPercent, formatPhone } from '@/lib/format';
import type { Progress } from '@/types';

export const metadata: Metadata = { title: 'Dashboard — Nursing Level Up' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requireStudentPage('/dashboard');
  const [attempts, purchases, progress] = await Promise.all([
    listAttempts(user.id, 20),
    listPurchases(user.id),
    progressForUser(user.id),
  ]);
  const owned = purchases.filter((p) => p.status === 'SUCCESS');
  const inProgress = attempts.filter((a) => a.status === 'IN_PROGRESS');
  const completed = attempts.filter((a) => a.status === 'COMPLETED');
  const firstName = user.name.split(' ')[0];
  const initials = user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-paper">
      {/* ── Hero / Welcome ── */}
      <div className="relative overflow-hidden border-b border-line/60 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600">
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-20" />
        <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 size-64 rounded-full bg-accent/10 blur-3xl" />
        <Container className="dash-container relative py-10 sm:py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="animate-slide-up">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-200/80">
                <span className="h-px w-5 bg-brand-300/50" />
                Dashboard
              </div>
              <h1 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-5xl">
                Welcome back, {firstName} 👋
              </h1>
              <p className="mt-2 text-base text-brand-100/70">
                {progress.tests_completed > 0
                  ? "You're making progress. Keep practicing consistently."
                  : 'Start your first test to begin tracking your nursing exam readiness.'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <ButtonLink
                href="/test-series"
                size="lg"
                className="rounded-full border border-white/20 bg-white/10 px-6 text-white backdrop-blur-sm hover:bg-white/20"
                variant="ghost"
              >
                Browse Test Series
              </ButtonLink>
              {inProgress.length > 0 && (
                <ButtonLink
                  href={`/tests/${inProgress[0].test_series_id}`}
                  size="lg"
                  className="rounded-full bg-white px-6 text-brand-700 shadow-lg hover:bg-brand-50"
                >
                  Resume Test
                </ButtonLink>
              )}
            </div>
          </div>
        </Container>
      </div>

      <Container className="dash-container py-10 sm:py-14">

        {/* ── Resume Banner ── */}
        {inProgress.length > 0 && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-brand-200/60 bg-gradient-to-r from-brand-50 to-brand-100/40 p-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-brand-800">You have an unfinished test</div>
                <div className="mt-0.5 text-sm text-brand-600">{inProgress[0].test_title}</div>
              </div>
            </div>
            <ButtonLink href={`/tests/${inProgress[0].test_series_id}`} size="sm" className="mt-4 sm:mt-0">
              Resume →
            </ButtonLink>
          </div>
        )}

        {/* ── Stats Row ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<TestsIcon />}
            label="Tests Attempted"
            value={progress.tests_attempted}
            hint={progress.tests_attempted === 0 ? 'Take your first test' : `${progress.tests_completed} completed`}
            accent="brand"
          />
          <StatCard
            icon={<CheckIcon />}
            label="Tests Completed"
            value={progress.tests_completed}
            hint={progress.tests_attempted > 0 ? `${Math.round((progress.tests_completed / Math.max(progress.tests_attempted, 1)) * 100)}% completion rate` : 'Keep going'}
            accent="brand"
          />
          <StatCard
            icon={<ChartIcon />}
            label="Average Score"
            value={formatPercent(progress.average_percentage)}
            hint={(progress.average_percentage ?? 0) >= 60 ? 'Great performance' : progress.tests_completed > 0 ? 'Keep practicing' : '—'}
            accent="accent"
          />
          <StatCard
            icon={<TrophyIcon />}
            label="Best Score"
            value={formatPercent(progress.best_percentage)}
            hint={(progress.best_percentage ?? 0) > 0 ? 'Personal best' : 'Complete a test'}
            accent="ok"
          />
        </div>

        {/* ── Progress + Profile ── */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Progress Card */}
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-line/60 px-7 py-5">
              <div>
                <h2 className="text-lg font-semibold text-ink">Your Progress</h2>
                <p className="mt-0.5 text-sm text-muted">Score history across completed tests</p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <div className="text-xs font-medium uppercase tracking-wide text-faint">Accuracy</div>
                  <div className="mt-0.5 font-serif text-2xl font-semibold text-brand-600 tabular-nums">
                    {formatPercent(progress.accuracy)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium uppercase tracking-wide text-faint">Answered</div>
                  <div className="mt-0.5 font-serif text-2xl font-semibold text-ink tabular-nums">
                    {progress.total_questions_answered}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-7 py-6">
              <ProgressChart trend={progress.trend} />
            </div>
          </Card>

          {/* Profile Card */}
          <Card className="flex flex-col p-0 overflow-hidden">
            <div className="border-b border-line/60 px-6 py-5">
              <h2 className="text-lg font-semibold text-ink">Profile</h2>
            </div>
            <div className="flex flex-1 flex-col p-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 font-serif text-xl font-semibold text-white shadow-md">
                  {initials}
                </div>
                <div>
                  <div className="font-semibold text-ink">{user.name}</div>
                  <div className="mt-0.5 text-sm text-brand-600">Nursing Student</div>
                </div>
              </div>

              {/* Details */}
              <dl className="mt-6 space-y-4 divide-y divide-line/50">
                <div className="pb-4">
                  <dt className="text-xs font-medium uppercase tracking-wider text-faint">Email</dt>
                  <dd className="mt-1 break-all text-sm font-medium text-ink">{user.email}</dd>
                </div>
                <div className="pt-4 pb-4">
                  <dt className="text-xs font-medium uppercase tracking-wider text-faint">Phone</dt>
                  <dd className="mt-1 text-sm font-medium text-ink">{formatPhone(user.phone) || '—'}</dd>
                </div>
                <div className="pt-4">
                  <dt className="text-xs font-medium uppercase tracking-wider text-faint">Tests</dt>
                  <dd className="mt-1 text-sm font-medium text-ink">
                    {progress.tests_completed} completed · {owned.length} series owned
                  </dd>
                </div>
              </dl>

              <div className="mt-6">
                <ButtonLink href="/profile" variant="secondary" size="sm" className="w-full justify-center rounded-xl">
                  Edit Profile
                </ButtonLink>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Quick Actions ── */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-ink">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction href="/test-series" icon={<SearchIcon />} label="Browse Test Series" desc="Find new practice tests" />
            {inProgress.length > 0 ? (
              <QuickAction href={`/tests/${inProgress[0].test_series_id}`} icon={<PlayIcon />} label="Continue Practice" desc={inProgress[0].test_title || 'Resume session'} highlight />
            ) : completed.length > 0 ? (
              <QuickAction href={`/results/${completed[0].id}`} icon={<PlayIcon />} label="Last Result" desc={completed[0].test_title || 'View result'} />
            ) : (
              <QuickAction href="/test-series" icon={<PlayIcon />} label="Start Practicing" desc="Begin your first test" />
            )}
            <QuickAction href="/test-series" icon={<StarIcon />} label="Free Tests" desc="No cost to get started" />
            <QuickAction href="/profile" icon={<UserIcon />} label="Edit Profile" desc="Update your details" />
          </div>
        </div>

        {/* ── Course Access & Enrollment ── */}
        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-ink">Course Access & Enrollment</h2>
            <Link href="/test-series" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
              Browse all tests →
            </Link>
          </div>
          {owned.length === 0 ? (
            <div className="overflow-hidden rounded-2xl border border-dashed border-brand-200 bg-gradient-to-br from-brand-50/60 to-surface p-10 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
                <BookIcon />
              </div>
              <h3 className="mt-4 font-serif text-xl text-ink">No course enrollment yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                Enroll in the Nursing Level Up Complete Course. Get full access to 200+ test series with new tests released daily at 5:00 PM IST!
              </p>
              <ButtonLink href="/course" className="mt-6 rounded-full px-6" size="md">
                Enroll in Course
              </ButtonLink>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {owned.map((p) => (
                <Card key={p.id} className="card-hover flex flex-col overflow-hidden p-0">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-brand-800 to-brand-600 px-5 py-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                      <BookIcon />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white">
                        {p.course_title ?? p.test_title ?? 'Complete Course'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="rounded-full bg-ok-50 px-2.5 py-0.5 text-ok font-semibold">Active Access</span>
                      <span>Enrolled {formatDate(p.created_at)}</span>
                    </div>
                    <div className="mt-2 text-sm text-muted">
                      {formatMoney(p.amount, p.currency)} · Daily 5 PM Releases
                    </div>
                    <div className="mt-5 flex gap-2">
                      <ButtonLink href="/test-series" size="sm" className="flex-1 justify-center rounded-lg">
                        Go to Test Series
                      </ButtonLink>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ── Recent Attempts ── */}
        <section className="mt-10 mb-4">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-ink">Recent Attempts</h2>
            <span className="text-sm text-muted">{attempts.length} total</span>
          </div>
          {attempts.length === 0 ? (
            <div className="overflow-hidden rounded-2xl border border-dashed border-line-strong bg-surface/60 p-10 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-sunken text-muted">
                <ChartIcon />
              </div>
              <h3 className="mt-4 font-serif text-xl text-ink">No attempts yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                Take a free test to see your results and track your progress.
              </p>
              <ButtonLink href="/test-series" size="md" className="mt-6 rounded-full px-6">
                Find a Free Test
              </ButtonLink>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-sm sm:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-sunken/40">
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted">Test</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted">Date</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted">Score</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted">Percentage</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted">Time</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {attempts.map((a) => (
                      <tr key={a.id} className="group transition-colors hover:bg-sunken/30">
                        <td className="max-w-[220px] truncate px-5 py-4 font-medium text-ink">{a.test_title}</td>
                        <td className="px-5 py-4 text-muted">{formatDate(a.submitted_at ?? a.started_at)}</td>
                        <td className="px-5 py-4 tabular-nums text-ink-2">
                          {a.status === 'COMPLETED' ? `${a.score}/${a.total_questions}` : '—'}
                        </td>
                        <td className="px-5 py-4">
                          {a.status === 'COMPLETED' ? (
                            <PercentBadge pct={a.percentage ?? 0} label={formatPercent(a.percentage)} />
                          ) : (
                            <StatusBadge status={a.status} />
                          )}
                        </td>
                        <td className="px-5 py-4 text-muted">{formatDuration(a.time_taken_seconds)}</td>
                        <td className="px-5 py-4 text-right">
                          {a.status === 'COMPLETED' ? (
                            <Link href={`/results/${a.id}`} className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700">
                              View Result →
                            </Link>
                          ) : a.status === 'IN_PROGRESS' ? (
                            <Link href={`/tests/${a.test_series_id}`} className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700">
                              Resume →
                            </Link>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 sm:hidden">
                {attempts.map((a) => (
                  <Card key={a.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-ink">{a.test_title}</div>
                        <div className="mt-1 text-xs text-muted">{formatDate(a.submitted_at ?? a.started_at)}</div>
                      </div>
                      {a.status === 'COMPLETED' ? (
                        <PercentBadge pct={a.percentage ?? 0} label={formatPercent(a.percentage)} />
                      ) : (
                        <StatusBadge status={a.status} />
                      )}
                    </div>
                    {a.status === 'COMPLETED' && (
                      <div className="mt-3 flex items-center justify-between text-sm text-muted">
                        <span>{a.score}/{a.total_questions} correct · {formatDuration(a.time_taken_seconds)}</span>
                        <Link href={`/results/${a.id}`} className="font-medium text-brand-600 hover:text-brand-700">
                          View →
                        </Link>
                      </div>
                    )}
                    {a.status === 'IN_PROGRESS' && (
                      <div className="mt-3">
                        <Link href={`/tests/${a.test_series_id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                          Resume →
                        </Link>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}
        </section>
      </Container>
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({
  icon, label, value, hint, accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent: 'brand' | 'accent' | 'ok';
}) {
  const accentMap = {
    brand: 'bg-brand-50 text-brand-600',
    accent: 'bg-accent-50 text-accent',
    ok: 'bg-ok-50 text-ok',
  };
  return (
    <Card className="card-hover group flex flex-col gap-4 p-6">
      <div className="flex items-start justify-between">
        <div className={`flex size-10 items-center justify-center rounded-xl ${accentMap[accent]}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">{label}</div>
        <div className="mt-1.5 font-serif text-4xl font-semibold tabular-nums text-ink">{value}</div>
        {hint && <div className="mt-1.5 text-xs text-muted">{hint}</div>}
      </div>
    </Card>
  );
}

function QuickAction({ href, icon, label, desc, highlight }: { href: string; icon: React.ReactNode; label: string; desc: string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        highlight
          ? 'border-brand-200/80 bg-brand-50 hover:border-brand-300 hover:bg-brand-100/60'
          : 'border-line bg-surface hover:border-brand-200/60 hover:bg-sunken/40'
      }`}
    >
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
        highlight ? 'bg-brand-600 text-white' : 'bg-sunken text-ink-2 group-hover:bg-brand-50 group-hover:text-brand-600'
      }`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className={`text-sm font-semibold ${highlight ? 'text-brand-700' : 'text-ink'}`}>{label}</div>
        <div className="mt-0.5 truncate text-xs text-muted">{desc}</div>
      </div>
    </Link>
  );
}

function PercentBadge({ pct, label }: { pct: number; label: string }) {
  const cls =
    pct >= 70
      ? 'bg-ok-50 text-ok ring-ok/15'
      : pct >= 40
      ? 'bg-brand-50 text-brand-700 ring-brand-100'
      : 'bg-sunken text-ink-2 ring-line';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${cls}`}>
      {label}
    </span>
  );
}

function ProgressChart({ trend }: { trend: Progress['trend'] }) {
  if (trend.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl bg-sunken/40">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-surface text-muted shadow-sm">
          <ChartIcon />
        </div>
        <p className="text-sm text-muted">Complete a test to start tracking your progress</p>
        <ButtonLink href="/test-series" size="sm" variant="secondary" className="mt-1 rounded-full px-5">
          Find a Test
        </ButtonLink>
      </div>
    );
  }
  return (
    <div>
      <div
        className="flex h-56 items-end gap-1.5 border-b border-line"
        role="img"
        aria-label={`Scores of your last ${trend.length} completed tests`}
      >
        {trend.map((t) => (
          <Link
            key={t.attempt_id}
            href={`/results/${t.attempt_id}`}
            className="group flex h-full flex-1 flex-col justify-end"
            title={`${t.test_title}: ${formatPercent(t.percentage)}`}
          >
            <span className="mb-1.5 text-center text-[11px] tabular-nums text-muted opacity-0 transition-opacity group-hover:opacity-100">
              {formatPercent(t.percentage)}
            </span>
            <span
              className="block w-full rounded-t-lg bg-brand-500/80 transition-all group-hover:bg-brand-600"
              style={{ height: `${Math.max(6, t.percentage)}%` }}
            />
          </Link>
        ))}
      </div>
      <div className="mt-2.5 flex justify-between text-xs text-faint">
        <span>{formatDate(trend[0].submitted_at)}</span>
        <span className="text-brand-600 font-medium">Latest →</span>
      </div>
    </div>
  );
}

/* ── Icons ── */
const TestsIcon = () => (
  <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
  </svg>
);
const CheckIcon = () => (
  <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);
const ChartIcon = () => (
  <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);
const TrophyIcon = () => (
  <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M10 1a.75.75 0 01.75.75v1.5h3a.75.75 0 010 1.5h-.315l-.424 3.178A4.75 4.75 0 0110 11.75a4.75 4.75 0 01-3.011-3.822L6.565 4.75H6.25a.75.75 0 010-1.5h3V1.75A.75.75 0 0110 1zM4.75 9.5a.75.75 0 000 1.5H6a.75.75 0 000-1.5H4.75zM14 9.5a.75.75 0 000 1.5h1.25a.75.75 0 000-1.5H14zM9.25 14.25v.5a.75.75 0 001.5 0v-.5h1.5a.75.75 0 000-1.5h-4.5a.75.75 0 000 1.5h1.5z" clipRule="evenodd" />
  </svg>
);
const SearchIcon = () => (
  <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);
const PlayIcon = () => (
  <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);
const StarIcon = () => (
  <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);
const UserIcon = () => (
  <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);
const BookIcon = () => (
  <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
  </svg>
);
