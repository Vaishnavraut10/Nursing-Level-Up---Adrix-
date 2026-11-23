import type { Metadata } from 'next';
import { AdminHeader, FilterBar, Pagination, filterInput, parsePage } from '@/components/admin/shared';
import { AdminNotesClient } from '@/components/admin/notes/AdminNotesClient';
import * as noteService from '@/lib/server/services/noteService';
import * as courseService from '@/lib/server/services/courseService';

export const metadata: Metadata = { title: 'Study Notes — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminNotesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    subject?: string;
    fileType?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);

  let isPublished: boolean | undefined = undefined;
  if (sp.status === 'published') isPublished = true;
  if (sp.status === 'draft') isPublished = false;

  const [data, stats, courses, subjects] = await Promise.all([
    noteService.listNotes({
      page,
      pageSize: 20,
      q: sp.q?.slice(0, 200) || undefined,
      subject: sp.subject || undefined,
      fileType: sp.fileType || undefined,
      isPublished,
    }),
    noteService.getAdminNoteStats(),
    courseService.adminList({ page: 1, pageSize: 100 }),
    noteService.listDistinctSubjects(),
  ]);

  return (
    <>
      <AdminHeader
        title="Study Notes"
        description="Upload and manage downloadable notes, study guides, and reference documents for students."
      />

      {/* Overview Stat Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted">Total Notes</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-ink">{stats.total}</div>
          <div className="mt-1 text-xs text-muted">{stats.publishedCount} published</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted">Total Downloads</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-brand-600">{stats.downloads}</div>
          <div className="mt-1 text-xs text-muted">Student accesses</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted">PDF Notes</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-rose-600">{stats.pdfCount}</div>
          <div className="mt-1 text-xs text-muted">.pdf files</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted">Word Documents</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-blue-600">{stats.wordCount}</div>
          <div className="mt-1 text-xs text-muted">.docx & .doc files</div>
        </div>
      </div>

      <FilterBar action="/admin/notes">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Search by title, subject, filename..."
          className={`${filterInput} w-64`}
          aria-label="Search"
        />

        <select name="subject" defaultValue={sp.subject ?? ''} className={filterInput} aria-label="Subject">
          <option value="">All subjects</option>
          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>

        <select name="fileType" defaultValue={sp.fileType ?? ''} className={filterInput} aria-label="File Type">
          <option value="">All formats</option>
          <option value="PDF">PDF</option>
          <option value="DOCX">Word (.docx)</option>
          <option value="DOC">Word (.doc)</option>
        </select>

        <select name="status" defaultValue={sp.status ?? ''} className={filterInput} aria-label="Status">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </FilterBar>

      <AdminNotesClient
        notes={data.items}
        courses={courses.items.map((c) => ({ id: c.id, title: c.title }))}
      />

      <Pagination
        base="/admin/notes"
        params={sp}
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
      />
    </>
  );
}
