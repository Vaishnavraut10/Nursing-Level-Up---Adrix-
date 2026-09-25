'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Course, PublicTestSeries } from '@/types';

interface CatalogGridProps {
  courses?: Course[] | null;
  series?: PublicTestSeries[] | null;
}

type FilterType = 'all' | 'free' | 'paid';

export interface CourseGroup {
  courseId: string;
  title: string;
  description: string | null;
  isFree: boolean;
  price: number;
  discountPrice: number | null;
  thumbnailUrl: string | null;
  tests: PublicTestSeries[];
}

function buildCourseGroups(courses?: Course[] | null, seriesList?: PublicTestSeries[] | null): CourseGroup[] {
  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeSeries = Array.isArray(seriesList) ? seriesList : [];

  const matchedSeriesIds = new Set<string>();

  const groups: CourseGroup[] = safeCourses.map((course) => {
    const tests = safeSeries.filter((s) => {
      if (!s) return false;
      const match = s.course_id === course.id || s.resolved_course_id === course.id;
      if (match) matchedSeriesIds.add(s.id);
      return match;
    });

    const isFree = Boolean(course.is_free || Number(course.price) === 0);

    return {
      courseId: course.id,
      title: course.title,
      description: course.description,
      isFree,
      price: Number(course.price),
      discountPrice: course.discount_price ? Number(course.discount_price) : null,
      thumbnailUrl: course.thumbnail_url || null,
      tests,
    };
  });

  // Include any orphaned series if no published courses were returned or matched
  const orphanedTests = safeSeries.filter((s) => s && !matchedSeriesIds.has(s.id));
  if (orphanedTests.length > 0 && safeCourses.length === 0) {
    const firstFree = orphanedTests.some((t) => t.is_free);
    groups.push({
      courseId: orphanedTests[0].resolved_course_id || orphanedTests[0].course_id || 'default-course',
      title: orphanedTests[0].course_title || 'Nursing Officer Course',
      description: orphanedTests[0].course_description || 'Practice smarter, prepare better for nursing officer exams.',
      isFree: firstFree,
      price: firstFree ? 0 : 299,
      discountPrice: null,
      thumbnailUrl: orphanedTests[0].thumbnail_url || null,
      tests: orphanedTests,
    });
  }

  return groups;
}

export function CatalogGrid({ courses = [], series = [] }: CatalogGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const allGroups = useMemo(() => buildCourseGroups(courses, series), [courses, series]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return allGroups;
    const q = searchQuery.toLowerCase().trim();
    return allGroups.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        (g.description && g.description.toLowerCase().includes(q)) ||
        g.tests.some(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.description && t.description.toLowerCase().includes(q))
        )
    );
  }, [allGroups, searchQuery]);

  // Tab counters (dynamically computed from all published course groups)
  const totalAllCount = allGroups.length;
  const totalFreeCount = allGroups.filter((g) => g.isFree).length;
  const totalPaidCount = allGroups.filter((g) => !g.isFree).length;

  const freeGroups = useMemo(() => filteredGroups.filter((g) => g.isFree), [filteredGroups]);
  const paidGroups = useMemo(() => filteredGroups.filter((g) => !g.isFree), [filteredGroups]);

  const showFree = (activeFilter === 'all' || activeFilter === 'free') && freeGroups.length > 0;
  const showPaid = (activeFilter === 'all' || activeFilter === 'paid') && paidGroups.length > 0;

  const hasAnyVisibleGroups = (activeFilter === 'all' && (freeGroups.length > 0 || paidGroups.length > 0)) ||
    (activeFilter === 'free' && freeGroups.length > 0) ||
    (activeFilter === 'paid' && paidGroups.length > 0);

  if (allGroups.length === 0) {
    return (
      <div className="rounded-2xl border border-line/80 bg-surface/70 px-6 py-16 text-center shadow-xs">
        <h3 className="font-serif text-xl font-semibold text-ink">No courses available.</h3>
        <p className="mt-1 text-sm text-muted">Please check back soon for new course releases.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ── Catalog Toolbar (Search + Filter tabs) ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-line/75 bg-surface/90 p-2.5 sm:p-3 shadow-xs backdrop-blur-xs">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
            <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses or topics..."
            className="w-full rounded-xl border border-transparent bg-paper/60 py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-muted/70 transition-all focus:border-brand-300 focus:bg-surface focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-ink transition-colors"
              aria-label="Clear search"
            >
              <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`cursor-pointer shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-muted hover:bg-paper hover:text-ink border border-line/60'
            }`}
          >
            All <span className="ml-1 opacity-75">({totalAllCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('free')}
            className={`cursor-pointer shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeFilter === 'free'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-muted hover:bg-paper hover:text-ink border border-line/60'
            }`}
          >
            Free <span className="ml-1 opacity-75">({totalFreeCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('paid')}
            className={`cursor-pointer shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeFilter === 'paid'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-muted hover:bg-paper hover:text-ink border border-line/60'
            }`}
          >
            Full Series <span className="ml-1 opacity-75">({totalPaidCount})</span>
          </button>
        </div>
      </div>

      {/* ── Empty State if no courses match filter / search ── */}
      {!hasAnyVisibleGroups && (
        <div className="rounded-2xl border border-line/80 bg-surface/70 px-6 py-16 text-center shadow-xs">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-paper text-muted ring-1 ring-line">
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <h3 className="mt-4 font-serif text-xl font-semibold text-ink">No courses match this filter.</h3>
          <p className="mt-1 text-sm text-muted">
            {searchQuery
              ? `No courses match "${searchQuery}". Try searching for another topic or clear the filter.`
              : 'No courses available for this section.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200/70 hover:bg-brand-100/80 transition-colors"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* ── Free Section ── */}
      {showFree && (
        <section aria-labelledby="free-section-h" className="space-y-6">
          <div className="flex items-end justify-between gap-4 border-b border-line/50 pb-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">
                <span className="size-1.5 rounded-full bg-brand-500" />
                Free Course Catalog
              </div>
              <h2 id="free-section-h" className="mt-1 font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
                Free
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted">
                Start practicing immediately — no payment required.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-ok-50 px-3 py-1 text-xs font-semibold text-ok ring-1 ring-inset ring-ok/20">
              {freeGroups.length} {freeGroups.length === 1 ? 'Course' : 'Courses'}
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {freeGroups.map((group) => (
              <CourseCard key={group.courseId} group={group} />
            ))}
          </div>
        </section>
      )}

      {/* ── Divider between Free and Paid sections ── */}
      {showFree && showPaid && (
        <div className="relative my-8 flex items-center justify-center" aria-hidden="true">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line/70" />
          </div>
          <div className="relative flex items-center gap-2 bg-paper px-4 text-xs font-medium text-muted uppercase tracking-wider">
            <span className="size-1.5 rounded-full bg-line-strong" />
            <span>Full Exam Preparation</span>
            <span className="size-1.5 rounded-full bg-line-strong" />
          </div>
        </div>
      )}

      {/* ── Full Series Section ── */}
      {showPaid && (
        <section aria-labelledby="paid-section-h" className="space-y-6">
          <div className="flex items-end justify-between gap-4 border-b border-line/50 pb-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Full Course Catalog
              </div>
              <h2 id="paid-section-h" className="mt-1 font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
                Full series
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted">
                For complete subject-wise practice & comprehensive exam preparation.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200/60">
              {paidGroups.length} {paidGroups.length === 1 ? 'Course' : 'Courses'}
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paidGroups.map((group) => (
              <CourseCard key={group.courseId} group={group} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CourseCard({ group }: { group: CourseGroup }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-line/80 bg-surface shadow-2xs hover:border-brand-300 hover:shadow-md transition-all duration-200">
      <div>
        {/* ── Top Course Thumbnail (16:9 Aspect Ratio) ── */}
        <div className="relative aspect-video w-full bg-gradient-to-br from-brand-900 via-brand-850 to-brand-950 overflow-hidden">
          {group.thumbnailUrl && !imageError ? (
            <img
              src={group.thumbnailUrl}
              alt={group.title}
              onError={() => setImageError(true)}
              className="size-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-between p-5 bg-gradient-to-r from-brand-900/90 to-brand-800/90">
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-widest text-brand-300 uppercase">Nursing Course</span>
                <h3 className="font-serif text-lg font-bold text-white leading-snug line-clamp-2">{group.title}</h3>
              </div>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-xs ring-1 ring-white/20">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* ── Content Area ── */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-brand-600">
              Nursing Exam
            </span>
            {group.isFree ? (
              <span className="rounded-full bg-ok-50 px-2.5 py-0.5 text-[11px] font-bold text-ok ring-1 ring-inset ring-ok/30">
                ● FREE
              </span>
            ) : group.discountPrice && group.discountPrice < group.price ? (
              <div className="flex items-center gap-1.5 font-bold text-amber-800 text-xs">
                <span className="line-through text-muted text-[11px]">₹{group.price}</span>
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-inset ring-amber-200">
                  ₹{group.discountPrice}
                </span>
              </div>
            ) : (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-inset ring-amber-200">
                ₹{group.price}
              </span>
            )}
          </div>

          <h3 className="font-serif text-lg font-bold text-ink leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
            <Link href={`/course?id=${group.courseId}`}>
              {group.title}
            </Link>
          </h3>

          {group.description && (
            <p className="text-xs text-muted leading-relaxed line-clamp-2">
              {group.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Footer / Bottom Bar ── */}
      <div className="p-5 pt-0 mt-2 flex items-center justify-between border-t border-line/50 pt-4">
        <span className="text-xs font-semibold text-muted flex items-center gap-1.5">
          <svg className="size-4 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {group.tests.length} {group.tests.length === 1 ? 'Test' : 'Tests'}
        </span>

        <Link
          href={`/course?id=${group.courseId}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 transition-colors"
        >
          <span>View Course</span>
          <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 0 1 1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
