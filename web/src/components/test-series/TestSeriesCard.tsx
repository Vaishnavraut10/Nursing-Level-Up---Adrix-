import Link from 'next/link';
import type { AccessState, PublicTestSeries } from '@/types';
import { formatPrice } from '@/lib/format';

const ACCESS_LABEL: Record<AccessState, string> = {
  FREE: 'Free',
  LOGIN_REQUIRED: 'Course Content',
  PURCHASE_REQUIRED: 'Included in Course',
  PURCHASED: 'Course Enrolled',
};

/* ── Subject Icon Detector ── */
function getSubjectIcon(title: string) {
  const lower = title.toLowerCase();

  if (lower.includes('pharmaco') || lower.includes('drug') || lower.includes('medicine')) {
    return {
      type: 'pharmacology',
      label: 'Pharmacology',
      color: 'text-rose-600 bg-rose-50 border-rose-200/60',
      icon: (
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
          <path d="m8.5 8.5 7 7" />
        </svg>
      ),
    };
  }

  if (lower.includes('community') || lower.includes('public health') || lower.includes('chn')) {
    return {
      type: 'community',
      label: 'Community Health',
      color: 'text-teal-700 bg-teal-50 border-teal-200/60',
      icon: (
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    };
  }

  if (lower.includes('obstetric') || lower.includes('gynaecolog') || lower.includes('gynecolog') || lower.includes('maternal') || lower.includes('obg')) {
    return {
      type: 'obg',
      label: 'OBG & Maternity',
      color: 'text-purple-700 bg-purple-50 border-purple-200/60',
      icon: (
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      ),
    };
  }

  if (lower.includes('fundamental') || lower.includes('foundation') || lower.includes('basic')) {
    return {
      type: 'fundamentals',
      label: 'Fundamentals',
      color: 'text-brand-700 bg-brand-50 border-brand-200/60',
      icon: (
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
          <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
          <circle cx="20" cy="10" r="2" />
        </svg>
      ),
    };
  }

  if (lower.includes('surg') || lower.includes('med-surg') || lower.includes('medical surgical')) {
    return {
      type: 'med-surg',
      label: 'Medical Surgical',
      color: 'text-blue-700 bg-blue-50 border-blue-200/60',
      icon: (
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    };
  }

  if (lower.includes('pediatric') || lower.includes('child')) {
    return {
      type: 'pediatric',
      label: 'Pediatric Nursing',
      color: 'text-amber-700 bg-amber-50 border-amber-200/60',
      icon: (
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      ),
    };
  }

  if (lower.includes('psych') || lower.includes('mental')) {
    return {
      type: 'psychiatric',
      label: 'Mental Health',
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200/60',
      icon: (
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
        </svg>
      ),
    };
  }

  /* Default Nursing Subject */
  return {
    type: 'general',
    label: 'Nursing Exam',
    color: 'text-brand-700 bg-brand-50 border-brand-200/60',
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 2a2 2 0 0 0-2 2v2H7a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2V4a2 2 0 0 0-2-2h-2z" />
      </svg>
    ),
  };
}

/* ── Free card ── */
export function FreeSeriesCard({ series }: { series: PublicTestSeries }) {
  const subject = getSubjectIcon(series.title);

  return (
    <Link
      href={`/tests/${series.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-line/75 bg-surface shadow-xs transition-all duration-250 hover:-translate-y-1 hover:border-brand-300/80 hover:shadow-[0_14px_38px_rgba(0,0,0,0.07),0_0_0_1px_rgba(31,122,115,0.12)]"
    >
      {/* Top teal accent stripe */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" aria-hidden="true" />

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        {/* Header row: Subject Icon + Free badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`flex size-8 items-center justify-center rounded-lg border ${subject.color} shadow-xs`} aria-hidden="true">
              {subject.icon}
            </span>
            <span className="text-xs font-medium text-muted">
              {subject.label}
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-ok ring-1 ring-inset ring-ok/20">
            <span className="size-1.5 rounded-full bg-ok" />
            Free
          </span>
        </div>

        {/* Title + Description */}
        <div className="mt-5 flex-1">
          <h3 className="font-serif text-[1.22rem] font-semibold leading-snug tracking-tight text-ink transition-colors duration-200 group-hover:text-brand-700">
            {series.title}
          </h3>
          {series.description && (
            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted">
              {series.description}
            </p>
          )}
        </div>

        {/* Divider + Metadata & CTA */}
        <div className="mt-6 pt-4 border-t border-line/60">
          <div className="flex items-center justify-between gap-2">
            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-ink-2">
              <span className="flex items-center gap-1.5" title="Total Questions">
                <QuestionIcon />
                <span className="font-semibold text-ink">{series.question_count}</span>
                <span className="text-muted">Questions</span>
              </span>
              <span className="flex items-center gap-1.5" title="Test Duration">
                <ClockIcon />
                <span className="font-semibold text-ink">{series.duration_minutes}</span>
                <span className="text-muted">min</span>
              </span>
            </div>

            {/* Clear Text CTA */}
            <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-brand-600 transition-all duration-200 group-hover:text-brand-700 group-hover:translate-x-0.5">
              <span>Solve test</span>
              <ArrowIcon />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Paid / Course card ── */
export function PaidSeriesCard({ series }: { series: PublicTestSeries }) {
  const isPurchased = series.access === 'PURCHASED';
  const isUnlocked = series.has_access;
  const isUpcoming = isPurchased && series.release_state === 'UPCOMING';
  const subject = getSubjectIcon(series.title);
  const targetUrl = isUnlocked ? `/tests/${series.id}` : `/test-series/${series.id}`;

  const releaseLabel =
    series.release_after_days === 0
      ? 'Day 1 Release'
      : `Day ${series.release_after_days + 1} Release`;

  return (
    <Link
      href={targetUrl}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-line-strong/60 bg-surface shadow-xs transition-all duration-250 hover:-translate-y-1 hover:border-amber-300/80 hover:shadow-[0_14px_38px_rgba(0,0,0,0.08),0_0_0_1px_rgba(180,83,42,0.12)]"
    >
      {/* Subtle premium gold top accent stripe */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" aria-hidden="true" />

      {/* Subtle corner watermark */}
      <div className="pointer-events-none absolute right-2 top-2 opacity-[0.035] text-ink" aria-hidden="true">
        <svg className="size-20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 10.5V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4.5l4 4v-11l-4 4Z" />
        </svg>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        {/* Header row: Subject Icon + Course Status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`flex size-8 items-center justify-center rounded-lg border ${subject.color} shadow-xs`} aria-hidden="true">
              {subject.icon}
            </span>
            <span className="text-xs font-medium text-muted">
              {subject.label}
            </span>
          </div>

          {isUnlocked ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-ok ring-1 ring-inset ring-ok/20">
              <span className="size-1.5 rounded-full bg-ok" />
              Unlocked
            </span>
          ) : isUpcoming ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-amber-700 ring-1 ring-inset ring-amber-200/60">
              <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              5 PM IST Release
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-brand-700 ring-1 ring-inset ring-brand-200/60">
              Course Pass
            </span>
          )}
        </div>

        {/* Title + Description */}
        <div className="mt-5 flex-1">
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
            <span className="inline-block size-1.5 rounded-full bg-amber-500/70" />
            <span>{releaseLabel}</span>
          </div>
          <h3 className="mt-1 font-serif text-[1.22rem] font-semibold leading-snug tracking-tight text-ink transition-colors duration-200 group-hover:text-brand-700">
            {series.title}
          </h3>
          {series.description && (
            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted">
              {series.description}
            </p>
          )}
        </div>

        {/* Divider + Metadata & CTA */}
        <div className="mt-6 pt-4 border-t border-line/60">
          <div className="flex items-center justify-between gap-2">
            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-ink-2">
              <span className="flex items-center gap-1.5" title="Total Questions">
                <QuestionIcon />
                <span className="font-semibold text-ink">{series.question_count}</span>
                <span className="text-muted">Questions</span>
              </span>
              <span className="flex items-center gap-1.5" title="Test Duration">
                <ClockIcon />
                <span className="font-semibold text-ink">{series.duration_minutes}</span>
                <span className="text-muted">min</span>
              </span>
            </div>

            {/* Clear Text CTA */}
            {isUnlocked ? (
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-ok transition-all duration-200 group-hover:text-ok group-hover:translate-x-0.5">
                <span>Solve test</span>
                <ArrowIcon />
              </span>
            ) : isUpcoming ? (
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-amber-700 transition-all duration-200 group-hover:text-amber-800">
                <span>View timing</span>
                <ArrowIcon />
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-brand-700 transition-all duration-200 group-hover:text-brand-800 group-hover:translate-x-0.5">
                <span>Course details</span>
                <ArrowIcon />
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* Legacy export used on the landing page */
export function TestSeriesCard({ series }: { series: PublicTestSeries }) {
  return series.is_free ? <FreeSeriesCard series={series} /> : <PaidSeriesCard series={series} />;
}

export function AccessBadge({ access }: { access: AccessState }) {
  return <span>{ACCESS_LABEL[access]}</span>;
}

/* ── Icons ── */
function QuestionIcon() {
  return (
    <svg className="size-4 shrink-0 text-brand-600/70" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 3a1 1 0 000 2h8a1 1 0 100-2H6zm0 4a1 1 0 100 2h5a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="size-4 shrink-0 text-brand-600/70" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="size-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}
