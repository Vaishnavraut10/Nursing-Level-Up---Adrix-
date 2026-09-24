import Link from 'next/link';
import { ButtonLink, StatusBadge, Table, Td, Th } from '@/components/ui';
import { AdminHeader, FilterBar, Pagination, filterInput, parsePage } from '@/components/admin/shared';
import { adminList } from '@/lib/server/services/courseService';
import { formatDate, formatMoney, formatPrice } from '@/lib/format';
import type { CourseStatus } from '@/types';

export const metadata = { title: 'Courses' };
export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(sp.status ?? '')
    ? (sp.status as CourseStatus)
    : undefined;

  const data = await adminList({
    page: parsePage(sp.page),
    pageSize: 20,
    q: sp.q?.slice(0, 200) || undefined,
    status,
  });

  return (
    <>
      <AdminHeader
        title="Courses"
        description="Manage the comprehensive course pass, pricing, and coupon codes. Published courses are immediately active on the student website."
        actions={<ButtonLink href="/admin/courses/create">New Course</ButtonLink>}
      />
      <FilterBar action="/admin/courses">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Search course title"
          className={`${filterInput} w-64`}
          aria-label="Search"
        />
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
            <Th>Course Title</Th>
            <Th>Base Price</Th>
            <Th>Promo Code & Discount</Th>
            <Th className="text-right">Test Series</Th>
            <Th className="text-right">Students Enrolled</Th>
            <Th className="text-right">Revenue</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((c) => (
            <tr key={c.id} className="hover:bg-sunken/40">
              <Td>
                <Link href={`/admin/courses/${c.id}`} className="font-semibold text-ink hover:text-brand-600">
                  {c.title}
                </Link>
                {c.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted max-w-md">{c.description}</p>
                )}
              </Td>
              <Td className="font-medium text-ink">₹{c.price}</Td>
              <Td>
                {c.promo_code ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200/60">
                    {c.promo_code} → ₹{c.discount_price ?? c.price}
                  </span>
                ) : (
                  <span className="text-xs text-muted">No coupon</span>
                )}
              </Td>
              <Td className="text-right tabular-nums font-medium">
                {c.test_series_count} series
              </Td>
              <Td className="text-right tabular-nums">
                {c.purchase_count} students
              </Td>
              <Td className="text-right tabular-nums font-semibold text-ink">
                {formatMoney(c.revenue, c.currency)}
              </Td>
              <Td>
                <StatusBadge status={c.status} />
              </Td>
              <Td className="whitespace-nowrap text-right">
                <Link href={`/admin/courses/${c.id}`} className="text-sm font-medium text-brand-600 hover:underline">
                  View
                </Link>
                <span className="mx-2 text-line-strong">|</span>
                <Link href={`/admin/courses/${c.id}/edit`} className="text-sm font-medium text-brand-600 hover:underline">
                  Edit
                </Link>
              </Td>
            </tr>
          ))}
          {data.items.length === 0 && (
            <tr>
              <Td colSpan={8} className="py-10 text-center text-muted">
                No courses found.
              </Td>
            </tr>
          )}
        </tbody>
      </Table>
      <Pagination base="/admin/courses" params={sp} page={data.page} totalPages={data.totalPages} total={data.total} />
    </>
  );
}
