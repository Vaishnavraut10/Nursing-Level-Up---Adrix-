import Link from 'next/link';
import { ButtonLink, StatusBadge, Table, Td, Th } from '@/components/ui';
import { AdminHeader, FilterBar, Pagination, filterInput, parsePage } from '@/components/admin/shared';
import { adminList } from '@/lib/server/services/dailyTestService';
import { formatDate } from '@/lib/format';
import type { TestStatus } from '@/types';

export const metadata = { title: 'Daily Test Series — Admin' };

export default async function AdminDailyTestsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(sp.status ?? '') ? (sp.status as TestStatus) : undefined;
  const data = await adminList({ page: parsePage(sp.page), pageSize: 20, q: sp.q?.slice(0, 200) || undefined, status });

  return (
    <>
      <AdminHeader
        title="Daily Test Series"
        description="Create and manage daily practice tests for students. Each daily test is published for a specific date."
        actions={<ButtonLink href="/admin/daily-tests/create">Create Daily Test</ButtonLink>}
      />
      <FilterBar action="/admin/daily-tests">
        <input name="q" defaultValue={sp.q} placeholder="Search title or category" className={`${filterInput} w-64`} aria-label="Search" />
        <select name="status" defaultValue={sp.status ?? ''} className={filterInput} aria-label="Status">
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </FilterBar>
      <Table>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Title</Th>
            <Th>Category</Th>
            <Th className="text-right">Questions</Th>
            <Th className="text-right">Duration</Th>
            <Th className="text-right">Total Marks</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((t) => (
            <tr key={t.id} className="hover:bg-sunken/40">
              <Td className="whitespace-nowrap font-medium text-ink">{formatDate(t.test_date)}</Td>
              <Td>
                <Link href={`/admin/daily-tests/${t.id}`} className="font-medium text-ink hover:text-brand-600">
                  {t.title}
                </Link>
              </Td>
              <Td>{t.category || 'Nursing'}</Td>
              <Td className="text-right tabular-nums">{t.question_count}</Td>
              <Td className="text-right tabular-nums">{t.duration_minutes} min</Td>
              <Td className="text-right tabular-nums">{t.total_marks}</Td>
              <Td><StatusBadge status={t.status} /></Td>
              <Td className="whitespace-nowrap text-right">
                <Link href={`/admin/daily-tests/${t.id}`} className="text-sm font-medium text-brand-600 hover:underline">
                  Edit / Questions
                </Link>
              </Td>
            </tr>
          ))}
          {data.items.length === 0 && (
            <tr>
              <Td colSpan={8} className="py-10 text-center text-muted">
                No daily tests found. Click &quot;Create Daily Test&quot; to add one.
              </Td>
            </tr>
          )}
        </tbody>
      </Table>
      <Pagination base="/admin/daily-tests" params={sp} page={data.page} totalPages={data.totalPages} total={data.total} />
    </>
  );
}
