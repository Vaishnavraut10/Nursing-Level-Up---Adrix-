import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUserPage } from '@/lib/server/session';
import * as noteService from '@/lib/server/services/noteService';
import { formatBytes, formatDate } from '@/lib/format';
import { cx } from '@/components/ui';
import type { Note, NoteFileType } from '@/types';

export const metadata: Metadata = {
  title: 'Study Notes & Materials — Nursing Level Up',
  description: 'Download high-yield nursing study notes, lecture guides, and clinical summaries in PDF and Word document format.',
};

export const dynamic = 'force-dynamic';

function NoteIcon({ type }: { type: NoteFileType }) {
  if (type === 'PDF') {
    return (
      <div className="flex size-11 items-center justify-center rounded-xl bg-rose-100 text-rose-700 ring-1 ring-rose-200/80">
        <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 2h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" opacity="0.3" />
          <path d="M14 2v6h6M8 12h2.5a1.5 1.5 0 0 0 0-3H8v5.5zm1.5-1.5h1a.5.5 0 0 0 0-1h-1v1zM13 14.5V9h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-1v1.5H13zm1.5-3h.5a.5.5 0 0 0 0-1h-.5v1z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex size-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 ring-1 ring-blue-200/80">
      <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 2h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" opacity="0.3" />
        <path d="M14 2v6h6M8 9.5l1.5 5 1.5-4 1.5 4 1.5-5h-1.2l-.8 3-1.5-3.8h-.9l-1.5 3.8-.8-3H8z" />
      </svg>
    </div>
  );
}

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    subject?: string;
    fileType?: string;
    page?: string;
  }>;
}) {
  // Guard: requires logged-in user
  await requireUserPage('/notes');

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim() || undefined;
  const subject = sp.subject?.trim() || undefined;
  const fileType = sp.fileType?.toUpperCase() || undefined;

  const [data, subjects] = await Promise.all([
    noteService.listPublishedNotes({
      page,
      pageSize: 18,
      q,
      subject,
      fileType,
    }),
    noteService.listDistinctSubjects(),
  ]);

  function buildUrl(newParams: Record<string, string | undefined>) {
    const merged = { ...sp, ...newParams };
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v) qs.set(k, v);
    }
    const s = qs.toString();
    return s ? `/notes?${s}` : '/notes';
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero / Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 px-6 py-10 text-white shadow-lg sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 size-80 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-brand-400 blur-3xl" />
        </div>

        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-100 backdrop-blur-sm">
            <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            Study Notes & Materials
          </span>
          <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Nursing Study Notes
          </h1>
          <p className="mt-3 text-base text-brand-100 sm:text-lg">
            Download comprehensive revision notes, clinical summaries, and faculty-curated materials in PDF and Word format for offline study.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-8 space-y-4">
        {/* Search Bar & Format Toggle */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form method="get" action="/notes" className="relative flex-1 max-w-md">
            <input
              type="text"
              name="q"
              defaultValue={sp.q ?? ''}
              placeholder="Search notes by title, topic, or keyword..."
              className="w-full rounded-xl border border-line-strong bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-faint focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <svg
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clipRule="evenodd"
              />
            </svg>
            {sp.subject && <input type="hidden" name="subject" value={sp.subject} />}
            {sp.fileType && <input type="hidden" name="fileType" value={sp.fileType} />}
          </form>

          {/* Format Filter Buttons */}
          <div className="flex items-center gap-1.5 rounded-lg bg-sunken p-1 text-xs font-medium">
            <Link
              href={buildUrl({ fileType: undefined, page: '1' })}
              className={cx(
                'rounded-md px-3 py-1.5 transition-colors',
                !sp.fileType ? 'bg-surface text-ink font-semibold shadow-sm' : 'text-muted hover:text-ink',
              )}
            >
              All Formats
            </Link>
            <Link
              href={buildUrl({ fileType: 'PDF', page: '1' })}
              className={cx(
                'rounded-md px-3 py-1.5 transition-colors',
                sp.fileType === 'PDF' ? 'bg-surface text-rose-700 font-semibold shadow-sm' : 'text-muted hover:text-ink',
              )}
            >
              PDF Notes
            </Link>
            <Link
              href={buildUrl({ fileType: 'DOCX', page: '1' })}
              className={cx(
                'rounded-md px-3 py-1.5 transition-colors',
                sp.fileType === 'DOCX' ? 'bg-surface text-blue-700 font-semibold shadow-sm' : 'text-muted hover:text-ink',
              )}
            >
              Word (.docx)
            </Link>
          </div>
        </div>

        {/* Subject Filter Pills */}
        {subjects.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-medium text-muted mr-1">Subject:</span>
            <Link
              href={buildUrl({ subject: undefined, page: '1' })}
              className={cx(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                !sp.subject
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface border border-line text-ink-2 hover:border-brand-300 hover:text-brand-700',
              )}
            >
              All Subjects
            </Link>
            {subjects.map((sub) => {
              const isActive = sp.subject === sub;
              return (
                <Link
                  key={sub}
                  href={buildUrl({ subject: sub, page: '1' })}
                  className={cx(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface border border-line text-ink-2 hover:border-brand-300 hover:text-brand-700',
                  )}
                >
                  {sub}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mt-6 flex items-center justify-between text-xs text-muted">
        <span>
          Showing <strong className="text-ink">{data.total}</strong> note{data.total === 1 ? '' : 's'}
          {sp.subject && <> in <strong className="text-brand-700">{sp.subject}</strong></>}
          {sp.q && <> matching &quot;<strong className="text-ink">{sp.q}</strong>&quot;</>}
        </span>
        {(sp.q || sp.subject || sp.fileType) && (
          <Link href="/notes" className="text-brand-600 hover:underline">
            Clear all filters
          </Link>
        )}
      </div>

      {/* Notes Grid */}
      {data.items.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((note: Note) => (
            <div
              key={note.id}
              className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
            >
              <div>
                {/* Header: Icon, Format & Subject */}
                <div className="flex items-start justify-between gap-3">
                  <NoteIcon type={note.file_type} />
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {note.subject && (
                      <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                        {note.subject}
                      </span>
                    )}
                    <span
                      className={cx(
                        'rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider',
                        note.file_type === 'PDF'
                          ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200'
                          : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
                      )}
                    >
                      {note.file_type}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="mt-4 text-base font-semibold leading-snug text-ink group-hover:text-brand-700 transition-colors">
                  {note.title}
                </h3>

                {note.description && (
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted">
                    {note.description}
                  </p>
                )}

                {/* Course linkage badge */}
                {note.course_title && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-brand-700">
                    <svg className="size-3.5 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 0 0-.788 0l-7 3a1 1 0 0 0 0 1.84L5.25 8.051a.999.999 0 0 1 .356-.257l4-1.714a1 1 0 1 1 .788 1.838L7.667 9.088l1.94.831a1 1 0 0 0 .787 0l7-3a1 1 0 0 0 0-1.838l-7-3Z" />
                    </svg>
                    <span className="truncate font-medium">{note.course_title}</span>
                  </div>
                )}
              </div>

              {/* Footer info & Download button */}
              <div className="mt-5 border-t border-line/80 pt-4">
                <div className="flex items-center justify-between text-xs text-muted mb-3">
                  <span className="font-medium">{formatBytes(note.size_bytes)}</span>
                  <span>{formatDate(note.created_at)}</span>
                  <span className="flex items-center gap-1 tabular-nums">
                    <svg className="size-3.5 opacity-60" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v7.586l-2.293-2.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L11 11.586V4a1 1 0 00-1-1z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    {note.download_count}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/api/notes/${note.id}/download`}
                    download
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow active:scale-[0.98]"
                  >
                    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Download
                  </a>

                  {note.file_type === 'PDF' && (
                    <a
                      href={`/api/notes/${note.id}/view`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-sunken hover:border-brand-300"
                      title="View PDF online"
                    >
                      <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                        <path
                          fillRule="evenodd"
                          d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface p-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-sunken text-muted">
            <svg className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-semibold text-ink">No study notes found</h3>
          <p className="mt-1.5 max-w-sm text-sm text-muted">
            {sp.q || sp.subject || sp.fileType
              ? 'No study notes matched your filter criteria. Try adjusting your search or clearing filters.'
              : 'Study notes and downloadable materials will be available here soon.'}
          </p>
          {(sp.q || sp.subject || sp.fileType) && (
            <Link
              href="/notes"
              className="mt-4 rounded-lg bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
            >
              Reset filters
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-line pt-4 text-sm text-muted">
          <span>
            Page {data.page} of {data.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={buildUrl({ page: String(data.page - 1) })}
              aria-disabled={data.page <= 1}
              className={cx(
                'rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium',
                data.page <= 1 ? 'pointer-events-none opacity-40' : 'hover:bg-sunken text-ink',
              )}
            >
              Previous
            </Link>
            <Link
              href={buildUrl({ page: String(data.page + 1) })}
              aria-disabled={data.page >= data.totalPages}
              className={cx(
                'rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium',
                data.page >= data.totalPages ? 'pointer-events-none opacity-40' : 'hover:bg-sunken text-ink',
              )}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
