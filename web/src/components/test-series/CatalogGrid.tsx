'use client';

import { useState, useMemo } from 'react';
import type { PublicTestSeries } from '@/types';
import { FreeSeriesCard, PaidSeriesCard } from './TestSeriesCard';

interface CatalogGridProps {
  free: PublicTestSeries[];
  paid: PublicTestSeries[];
}

type FilterType = 'all' | 'free' | 'paid';

export function CatalogGrid({ free, paid }: CatalogGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredFree = useMemo(() => {
    if (!searchQuery.trim()) return free;
    const query = searchQuery.toLowerCase().trim();
    return free.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query))
    );
  }, [free, searchQuery]);

  const filteredPaid = useMemo(() => {
    if (!searchQuery.trim()) return paid;
    const query = searchQuery.toLowerCase().trim();
    return paid.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query))
    );
  }, [paid, searchQuery]);

  const showFree = (activeFilter === 'all' || activeFilter === 'free') && filteredFree.length > 0;
  const showPaid = (activeFilter === 'all' || activeFilter === 'paid') && filteredPaid.length > 0;
  const totalMatches = (activeFilter === 'free' ? filteredFree.length : 0) +
    (activeFilter === 'paid' ? filteredPaid.length : 0) +
    (activeFilter === 'all' ? filteredFree.length + filteredPaid.length : 0);

  const totalAllCount = free.length + paid.length;

  return (
    <div className="space-y-12">
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
            placeholder="Search test series by subject, title or topic..."
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
            Free <span className="ml-1 opacity-75">({free.length})</span>
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
            Full Series <span className="ml-1 opacity-75">({paid.length})</span>
          </button>
        </div>
      </div>

      {/* ── Empty State if no tests match search ── */}
      {totalMatches === 0 && (
        <div className="rounded-2xl border border-line/80 bg-surface/70 px-6 py-16 text-center shadow-xs">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-paper text-muted ring-1 ring-line">
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <h3 className="mt-4 font-serif text-xl font-semibold text-ink">No test series found</h3>
          <p className="mt-1 text-sm text-muted">
            {searchQuery
              ? `No tests match "${searchQuery}". Try searching for another topic or clear the filter.`
              : 'No test series available for this filter.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200/70 hover:bg-brand-100/80 transition-colors"
          >
            <span>Reset filters</span>
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
                Free test series
              </div>
              <h2 id="free-section-h" className="mt-1 font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
                Free
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted">
                Start practicing immediately — no payment required.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-ok-50 px-3 py-1 text-xs font-semibold text-ok ring-1 ring-inset ring-ok/20">
              {filteredFree.length} {filteredFree.length === 1 ? 'Series' : 'Series'}
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFree.map((s) => (
              <FreeSeriesCard key={s.id} series={s} />
            ))}
          </div>
        </section>
      )}

      {/* ── Divider between Free and Paid sections ── */}
      {showFree && showPaid && (
        <div className="relative my-10 flex items-center justify-center" aria-hidden="true">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line/70" />
          </div>
          <div className="relative flex items-center gap-2 bg-paper px-4 text-xs font-medium text-muted uppercase tracking-wider">
            <span className="size-1.5 rounded-full bg-line-strong" />
            <span>Choose your practice</span>
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
                Full test series
              </div>
              <h2 id="paid-section-h" className="mt-1 font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
                Full series
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted">
                For complete subject-wise practice & comprehensive exam preparation.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200/60">
              {filteredPaid.length} {filteredPaid.length === 1 ? 'Series' : 'Series'}
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPaid.map((s) => (
              <PaidSeriesCard key={s.id} series={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
