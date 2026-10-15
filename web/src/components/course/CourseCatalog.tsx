'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Course } from '@/types';
import { Container } from '@/components/ui';

interface CourseCatalogProps {
  courses: Course[];
}

type FilterType = 'all' | 'paid' | 'free';

export function CourseCatalog({ courses = [] }: CourseCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Deduplicate courses by id to ensure no duplicate cards appear
  const uniqueCourses = useMemo(() => {
    const map = new Map<string, Course>();
    for (const c of courses || []) {
      if (c && c.id && !map.has(c.id)) {
        map.set(c.id, c);
      }
    }
    return Array.from(map.values());
  }, [courses]);

  // Dynamic filter by search query (course title and description only)
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return uniqueCourses;
    const q = searchQuery.toLowerCase().trim();
    return uniqueCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [uniqueCourses, searchQuery]);

  // Segregate strictly:
  // Free: is_free === true OR price === 0
  // Paid: !is_free AND price > 0
  const freeCourses = useMemo(
    () => filteredCourses.filter((c) => Boolean(c.is_free || Number(c.price) === 0)),
    [filteredCourses]
  );
  const paidCourses = useMemo(
    () => filteredCourses.filter((c) => !c.is_free && Number(c.price) > 0),
    [filteredCourses]
  );

  // Tab counters dynamically calculated from all available published courses
  const totalAllCount = uniqueCourses.length;
  const totalFreeCount = uniqueCourses.filter((c) => Boolean(c.is_free || Number(c.price) === 0)).length;
  const totalPaidCount = uniqueCourses.filter((c) => !c.is_free && Number(c.price) > 0).length;

  const showFree = (activeFilter === 'all' || activeFilter === 'free') && freeCourses.length > 0;
  const showPaid = (activeFilter === 'all' || activeFilter === 'paid') && paidCourses.length > 0;
  const hasVisibleCourses = showFree || showPaid;

  return (
    <div className="relative min-h-screen bg-paper py-10 sm:py-14">
      {/* Background glow & subtle depth */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          className="mx-auto h-[480px] w-full max-w-6xl opacity-35 blur-3xl"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 15%, rgba(31, 122, 115, 0.16), transparent 75%)',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-96 opacity-25 hero-grid" />
      </div>

      <Container className="relative z-10 max-w-6xl">
        {/* ── Page Header ── */}
        <header className="mb-10 sm:mb-12">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600">
            <span className="h-px w-5 bg-brand-500/70" />
            Nursing Exam Preparation · All Courses
          </div>
          <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-5xl">
            Course Catalog
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            High-yield, exam-level nursing courses designed for NORCET, GMCH, AIIMS, and State Nursing Officer exams. Select a course to start your preparation.
          </p>

          {/* Quick Stats Pill Row */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-line/80 bg-surface/80 px-3.5 py-1.5 shadow-2xs">
              <span className="flex size-2 rounded-full bg-brand-500" />
              <span className="font-semibold text-ink">{totalAllCount}</span>
              <span className="text-muted">{totalAllCount === 1 ? 'Course' : 'Courses'} Total</span>
            </div>
            {totalPaidCount > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-line/80 bg-surface/80 px-3.5 py-1.5 shadow-2xs">
                <span className="flex size-2 rounded-full bg-amber-500" />
                <span className="font-semibold text-ink">{totalPaidCount}</span>
                <span className="text-muted">Paid Course Series</span>
              </div>
            )}
            {totalFreeCount > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-line/80 bg-surface/80 px-3.5 py-1.5 shadow-2xs">
                <span className="flex size-2 rounded-full bg-ok" />
                <span className="font-semibold text-ink">{totalFreeCount}</span>
                <span className="text-muted">Free Test Series</span>
              </div>
            )}
          </div>
        </header>

        {/* ── Catalog Toolbar (Search & Filter Tabs) ── */}
        <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-line/75 bg-surface/90 p-3 shadow-2xs backdrop-blur-xs sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
              <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses by title or subject..."
              className="w-full rounded-xl border border-transparent bg-paper/70 py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-muted/70 transition-all focus:border-brand-300 focus:bg-surface focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted transition-colors hover:text-ink cursor-pointer"
                aria-label="Clear search"
              >
                <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`cursor-pointer shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'border border-line/60 text-muted hover:bg-paper hover:text-ink'
              }`}
            >
              All Courses <span className="ml-1 opacity-75">({totalAllCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('paid')}
              className={`cursor-pointer shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeFilter === 'paid'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'border border-line/60 text-muted hover:bg-paper hover:text-ink'
              }`}
            >
              Paid Course Series <span className="ml-1 opacity-75">({totalPaidCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('free')}
              className={`cursor-pointer shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeFilter === 'free'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'border border-line/60 text-muted hover:bg-paper hover:text-ink'
              }`}
            >
              Free Test Series <span className="ml-1 opacity-75">({totalFreeCount})</span>
            </button>
          </div>
        </div>

        {/* ── Empty State if No Courses ── */}
        {!hasVisibleCourses && (
          <div className="rounded-2xl border border-line/80 bg-surface/70 px-6 py-16 text-center shadow-xs">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-paper text-muted ring-1 ring-line">
              <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <h3 className="mt-4 font-serif text-xl font-semibold text-ink">No courses found</h3>
            <p className="mt-1 text-sm text-muted">
              {searchQuery
                ? `No courses matched "${searchQuery}". Try searching for another topic or clear the filter.`
                : 'No published courses are available in this section at the moment.'}
            </p>
            {(searchQuery || activeFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200/70 transition-colors hover:bg-brand-100 cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {/* ── 1. Paid Course Series Section ── */}
        {showPaid && (
          <section aria-labelledby="paid-courses-heading" className="space-y-6">
            <div className="flex flex-col gap-2 border-b border-line/60 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  Full Exam Preparation
                </div>
                <h2 id="paid-courses-heading" className="mt-1 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  Paid Course Series
                </h2>
                <p className="mt-1 text-xs text-muted sm:text-sm">
                  Complete exam-level MCQ courses with daily releases, detailed clinical rationales, and progress analytics.
                </p>
              </div>
              <span className="self-start shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200/70 sm:self-auto">
                {paidCourses.length} {paidCourses.length === 1 ? 'Course' : 'Courses'}
              </span>
            </div>

            {/* Responsive Card Grid (3 columns on desktop, 2 on tablet, 1 on mobile) */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-7">
              {paidCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}

        {/* ── Visual Section Divider ── */}
        {showPaid && showFree && (
          <div className="relative my-12 flex items-center justify-center" aria-hidden="true">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line/70" />
            </div>
            <div className="relative flex items-center gap-2 bg-paper px-4 text-xs font-semibold uppercase tracking-wider text-muted">
              <span className="size-1.5 rounded-full bg-brand-500" />
              <span>Free Practice Courses</span>
              <span className="size-1.5 rounded-full bg-brand-500" />
            </div>
          </div>
        )}

        {/* ── 2. Free Test Series Section ── */}
        {showFree && (
          <section aria-labelledby="free-courses-heading" className="space-y-6">
            <div className="flex flex-col gap-2 border-b border-line/60 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">
                  <span className="size-1.5 rounded-full bg-brand-500" />
                  Get Started Free
                </div>
                <h2 id="free-courses-heading" className="mt-1 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  Free Test Series
                </h2>
                <p className="mt-1 text-xs text-muted sm:text-sm">
                  Practice immediately with free exam-level test series courses — zero payment required.
                </p>
              </div>
              <span className="self-start shrink-0 rounded-full bg-ok-50 px-3 py-1 text-xs font-semibold text-ok ring-1 ring-inset ring-ok/30 sm:self-auto">
                {freeCourses.length} {freeCourses.length === 1 ? 'Course' : 'Courses'}
              </span>
            </div>

            {/* Responsive Card Grid (3 columns on desktop, 2 on tablet, 1 on mobile) */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-7">
              {freeCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}

/**
 * Individual Course Card Component
 * Strictly displays parent course information only:
 * 1. Thumbnail (16:9 aspect ratio, object-fit: cover, with image fallback)
 * 2. Course title (actual name, wrapping naturally)
 * 3. Price (correct formatted price / Free badge)
 * 4. Action button (View Course -> opens parent course details page)
 * Never displays individual tests, test series entries, questions, durations, or counts.
 */
function CourseCard({ course }: { course: Course }) {
  const [imageError, setImageError] = useState(false);
  const isFree = Boolean(course.is_free || Number(course.price) === 0);
  const hasDiscount =
    !isFree &&
    course.discount_price !== null &&
    course.discount_price !== undefined &&
    Number(course.discount_price) > 0 &&
    Number(course.discount_price) < Number(course.price);

  return (
    <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-line/80 bg-surface shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
      <div>
        {/* ── 1. Course Thumbnail (16:9 Aspect Ratio) ── */}
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-850">
          {course.thumbnail_url && !imageError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={course.thumbnail_url}
              alt={course.title}
              onError={() => setImageError(true)}
              className="size-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col justify-between p-5 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-850 text-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-300">
                  Nursing Level Up
                </span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-brand-200 backdrop-blur-xs ring-1 ring-white/15">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                    <path d="M6 6h10" />
                    <path d="M6 10h10" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="font-serif text-base font-bold leading-snug line-clamp-2 text-white">
                  {course.title}
                </p>
              </div>
            </div>
          )}

          {/* Badge overlay on thumbnail */}
          <div className="absolute top-3 right-3">
            {isFree ? (
              <span className="inline-flex items-center rounded-full bg-emerald-600/95 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs backdrop-blur-xs">
                FREE
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-brand-950/85 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-white shadow-xs backdrop-blur-xs ring-1 ring-white/20">
                ₹{course.price}
              </span>
            )}
          </div>
        </div>

        {/* ── 2. Card Content (Title, Badges, Description) ── */}
        <div className="space-y-3 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
              {isFree ? 'Free Mock Series' : 'Comprehensive Course'}
            </span>
            {isFree ? (
              <span className="rounded-full bg-ok-50 px-2 py-0.5 text-[11px] font-bold text-ok ring-1 ring-inset ring-ok/30">
                ● FREE
              </span>
            ) : hasDiscount ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted line-through">₹{course.price}</span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-inset ring-amber-200">
                  ₹{course.discount_price}
                </span>
              </div>
            ) : (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-inset ring-amber-200">
                ₹{course.price}
              </span>
            )}
          </div>

          {/* Course Title (Wrapping naturally, no truncation clipping) */}
          <h3 className="font-serif text-lg font-bold leading-snug text-ink transition-colors group-hover:text-brand-700 sm:text-xl">
            <Link
              href={`/course?id=${course.id}`}
              className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              {course.title}
            </Link>
          </h3>

          {/* Course Description */}
          {course.description ? (
            <p className="text-xs leading-relaxed text-muted line-clamp-2 sm:text-sm">
              {course.description}
            </p>
          ) : (
            <p className="text-xs leading-relaxed text-muted/80 line-clamp-2 sm:text-sm">
              Comprehensive nursing officer exam preparation course with clinical rationales and structured practice.
            </p>
          )}
        </div>
      </div>

      {/* ── 3. Card Footer (Price indicator & View Course Action) ── */}
      <div className="mt-2 flex items-center justify-between border-t border-line/60 p-5 pt-4 sm:p-6 sm:pt-4">
        <div>
          {isFree ? (
            <span className="text-xs font-semibold text-emerald-700">Free Access</span>
          ) : (
            <span className="text-xs font-semibold text-ink">
              ₹{hasDiscount ? course.discount_price : course.price}
              <span className="ml-1 text-[11px] font-normal text-muted">one-time</span>
            </span>
          )}
        </div>

        <Link
          href={`/course?id=${course.id}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all duration-150 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <span>View Course</span>
          <svg
            className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
