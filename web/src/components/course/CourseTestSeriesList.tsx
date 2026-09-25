'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { PublicTestSeries } from '@/types';
import { ButtonLink } from '@/components/ui';

interface CourseTestSeriesListProps {
  series: PublicTestSeries[];
  hasCourseAccess: boolean;
}

export function CourseTestSeriesList({ series, hasCourseAccess }: CourseTestSeriesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'ready' | 'upcoming'>('all');

  const availableCount = series.filter((s) => s.has_access).length;
  const upcomingCount = series.filter((s) => !s.has_access && s.access === 'PURCHASED').length;

  const filtered = useMemo(() => {
    let list = series;
    if (filter === 'ready') {
      list = list.filter((s) => s.has_access);
    } else if (filter === 'upcoming') {
      list = list.filter((s) => !s.has_access && s.access === 'PURCHASED');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [series, filter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header and Filter Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700">
            <span className="size-2 rounded-full bg-brand-500" />
            Included Test Series
          </div>
          <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-ink">
            Course Curriculum ({series.length} Tests)
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            {hasCourseAccess
              ? 'Click "Solve Test" on any unlocked series to start practicing immediately.'
              : 'Enroll in the course to unlock all test series on your daily schedule.'}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`cursor-pointer shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-muted hover:bg-paper hover:text-ink border border-line/60'
            }`}
          >
            All Tests ({series.length})
          </button>
          {hasCourseAccess && (
            <>
              <button
                type="button"
                onClick={() => setFilter('ready')}
                className={`cursor-pointer shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  filter === 'ready'
                    ? 'bg-ok text-white shadow-xs'
                    : 'text-muted hover:bg-paper hover:text-ink border border-line/60'
                }`}
              >
                Ready to Solve ({availableCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('upcoming')}
                className={`cursor-pointer shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  filter === 'upcoming'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-muted hover:bg-paper hover:text-ink border border-line/60'
                }`}
              >
                Upcoming ({upcomingCount})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search test series by topic, subject, or title..."
          className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-muted/70 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-ink"
          >
            ✕
          </button>
        )}
      </div>

      {/* Test Series Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line/80 bg-surface/70 px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">No test series match your filter.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilter('all');
            }}
            className="mt-3 text-xs font-semibold text-brand-700 underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((ts, idx) => {
            const isUnlocked = ts.has_access;
            const isUpcoming = !ts.has_access && ts.access === 'PURCHASED';
            const dayLabel =
              ts.release_after_days === 0
                ? 'Day 1 (Immediate)'
                : `Day ${ts.release_after_days + 1} (5:00 PM IST)`;

            // If unlocked or free, direct destination is to solve the test immediately
            const canSolve = isUnlocked || ts.is_free;
            const targetUrl = canSolve ? `/tests/${ts.id}` : '#enrollment';

            return (
              <div
                key={ts.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-surface p-5 shadow-2xs transition-all duration-200 ${
                  isUnlocked
                    ? 'border-ok/40 hover:border-ok hover:shadow-md'
                    : 'border-line/80 hover:border-brand-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Row: Test Index + Release Day + Status Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 text-xs font-bold font-mono text-ink bg-paper px-2 py-0.5 rounded-lg border border-line/70">
                        {idx < 9 ? `0${idx + 1}` : `${idx + 1}`}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-0.5 text-[11px] font-semibold text-muted ring-1 ring-line/70">
                        <span className="size-1.5 rounded-full bg-brand-500" />
                        {dayLabel}
                      </span>
                    </div>

                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-50 px-2.5 py-0.5 text-[11px] font-semibold text-ok ring-1 ring-inset ring-ok/25">
                        <span className="size-1.5 rounded-full bg-ok animate-pulse" />
                        Ready to Solve
                      </span>
                    ) : isUpcoming ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200/60">
                        <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {ts.releases_at
                          ? new Date(ts.releases_at).toLocaleDateString('en-IN', {
                              timeZone: 'Asia/Kolkata',
                              month: 'short',
                              day: 'numeric',
                            }) + ' · 5 PM'
                          : '5:00 PM IST'}
                      </span>
                    ) : ts.is_free ? (
                      <span className="inline-flex items-center rounded-full bg-ok-50 px-2 py-0.5 text-[11px] font-semibold text-ok ring-1 ring-inset ring-ok/20">
                        Free Test
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-paper px-2 py-0.5 text-[11px] font-medium text-muted ring-1 ring-line">
                        Course Pass
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-3 font-serif text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-brand-700">
                    {canSolve ? (
                      <Link href={`/tests/${ts.id}`} title="Click to solve test">
                        {ts.title}
                      </Link>
                    ) : (
                      <a
                        href="#course-payment"
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById('course-payment') || document.getElementById('course-access') || document.getElementById('enrollment');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        title="Enroll in course to unlock"
                      >
                        {ts.title}
                      </a>
                    )}
                  </h3>
                  {ts.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
                      {ts.description}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Metadata & Direct Action Button */}
                <div className="mt-5 flex items-center justify-between border-t border-line/60 pt-3.5">
                  <div className="flex items-center gap-2.5 text-xs text-muted">
                    <span className="font-semibold text-ink-2">{ts.question_count} Qs</span>
                    <span>·</span>
                    <span>{ts.duration_minutes} min</span>
                    <span>·</span>
                    <Link
                      href={`/test-series/${ts.id}`}
                      className="text-[11px] text-muted hover:text-brand-700 underline underline-offset-2"
                      title="View test instructions and details"
                    >
                      Details
                    </Link>
                  </div>

                  {/* Direct Solve / Unlock Button */}
                  {isUnlocked ? (
                    <ButtonLink
                      href={`/tests/${ts.id}`}
                      size="sm"
                      className="rounded-xl px-4 py-1.5 font-semibold text-xs shadow-xs bg-brand-700 hover:bg-brand-800 text-white inline-flex items-center gap-1.5"
                    >
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="6 4 20 12 6 20 6 4" />
                      </svg>
                      Solve Test →
                    </ButtonLink>
                  ) : isUpcoming ? (
                    <span className="rounded-xl bg-sunken px-3 py-1.5 text-xs font-medium text-muted ring-1 ring-line/60">
                      Unlocks at 5 PM IST
                    </span>
                  ) : ts.is_free ? (
                    <ButtonLink
                      href={`/tests/${ts.id}`}
                      size="sm"
                      className="rounded-xl px-4 py-1.5 font-semibold text-xs shadow-xs bg-brand-700 hover:bg-brand-800 text-white inline-flex items-center gap-1.5"
                    >
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="6 4 20 12 6 20 6 4" />
                      </svg>
                      Solve Free Test →
                    </ButtonLink>
                  ) : (
                    <a
                      href="#course-payment"
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById('course-payment') || document.getElementById('course-access') || document.getElementById('enrollment');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="inline-flex items-center gap-1 rounded-xl bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200/70 hover:bg-brand-100 transition-colors cursor-pointer"
                    >
                      Solve Test →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
