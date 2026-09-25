import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ButtonLink, Card, Stat, StatusBadge, Table, Td, Th } from '@/components/ui';
import { AdminHeader } from '@/components/admin/shared';
import { ActionButton } from '@/components/admin/ActionButton';
import { adminGet, getCourseTestSeries } from '@/lib/server/services/courseService';
import { listForEntity } from '@/lib/server/services/auditService';
import { formatDateTime, formatMoney } from '@/lib/format';
import { uuidSchema } from '@/lib/validation';

export const metadata = { title: 'Course Details' };
export const dynamic = 'force-dynamic';

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const course = await adminGet(id).catch(() => null);
  if (!course) notFound();

  const [seriesList, history] = await Promise.all([
    getCourseTestSeries(id),
    listForEntity('course', id),
  ]);

  const base = `/api/admin/courses/${id}`;

  return (
    <>
      <AdminHeader
        back={{ href: '/admin/courses', label: 'Courses' }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {course.title} <StatusBadge status={course.status} />
          </span>
        }
        description={`${course.is_free || Number(course.price) === 0 ? 'FREE Course' : `₹${course.price}${course.discount_price ? ` (₹${course.discount_price} with ${course.promo_code})` : ''}`} · created ${formatDateTime(course.created_at)}`}
        actions={
          <>
            <ButtonLink href={`/admin/courses/${id}/edit`} variant="secondary" size="sm">
              Edit
            </ButtonLink>
            {course.status !== 'PUBLISHED' && (
              <ActionButton
                endpoint={`${base}/publish`}
                label="Publish"
                variant="primary"
                confirm={{
                  title: 'Publish this course?',
                  message: 'This course and its pricing will be immediately active and visible to all students on the website.',
                  confirmLabel: 'Publish',
                }}
              />
            )}
            {course.status === 'PUBLISHED' && (
              <ActionButton
                endpoint={`${base}/unpublish`}
                label="Unpublish"
                confirm={{
                  title: 'Unpublish course?',
                  message: 'The course will be hidden from new students. Existing student enrollments remain active.',
                }}
              />
            )}
            {course.status !== 'ARCHIVED' && (
              <ActionButton
                endpoint={`${base}/archive`}
                label="Archive"
                confirm={{
                  title: 'Archive course?',
                  message: 'Archived courses are hidden from enrollment. Past enrollment records are kept intact.',
                }}
              />
            )}
            {course.status !== 'DELETED' && (
              <ActionButton
                endpoint={base}
                method="DELETE"
                label="Delete"
                variant="danger"
                redirectTo="/admin/courses"
                confirm={{
                  title: 'Delete this course?',
                  message: 'This course will be removed from the student portal and new purchases will be disabled. All test series assigned to this course will also be removed from student access. Historical purchases, attempts, questions and results will be preserved.',
                  danger: true,
                  confirmLabel: 'Delete Course',
                }}
              />
            )}
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total Test Series" value={course.test_series_count} hint="Assigned to this course" />
        <Stat label="Students Enrolled" value={course.purchase_count} />
        <Stat label="Total Revenue" value={formatMoney(course.revenue, course.currency)} />
        <Stat
          label="Course Type"
          value={course.is_free || Number(course.price) === 0 ? 'FREE' : 'PAID'}
          hint={course.is_free || Number(course.price) === 0 ? 'Instant student access' : (course.discount_price ? `₹${course.price} → ₹${course.discount_price}` : undefined)}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main Column: Test Series in Course */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div>
                <h2 className="text-base font-semibold text-ink">Assigned Test Series & Drip Schedule</h2>
                <p className="mt-0.5 text-xs text-muted">
                  Test series unlock on the student&apos;s daily schedule starting from access date at 5:00 PM IST.
                </p>
              </div>
              <ButtonLink href="/admin/test-series/create" size="sm">
                Add Test Series
              </ButtonLink>
            </div>

            <div className="mt-4">
              <Table>
                <thead>
                  <tr>
                    <Th>Series Title</Th>
                    <Th>Drip Schedule</Th>
                    <Th className="text-right">Questions</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {seriesList.map((ts) => (
                    <tr key={ts.id} className="hover:bg-sunken/40">
                      <Td>
                        <Link href={`/admin/test-series/${ts.id}`} className="font-semibold text-ink hover:text-brand-600">
                          {ts.title}
                        </Link>
                      </Td>
                      <Td>
                        <span className="inline-flex items-center gap-1.5 font-medium text-xs text-ink-2">
                          {ts.release_after_days === 0 ? (
                            <span className="rounded-full bg-ok-50 px-2 py-0.5 text-[11px] font-semibold text-ok ring-1 ring-ok/20">
                              Day 1 · Immediate
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200/60">
                              Day {ts.release_after_days + 1} · 5 PM IST
                            </span>
                          )}
                        </span>
                      </Td>
                      <Td className="text-right tabular-nums">{ts.question_count}</Td>
                      <Td>
                        <StatusBadge status={ts.status} />
                      </Td>
                      <Td className="text-right whitespace-nowrap">
                        <Link href={`/admin/test-series/${ts.id}/edit`} className="text-xs font-semibold text-brand-600 hover:underline">
                          Edit Timing
                        </Link>
                      </Td>
                    </tr>
                  ))}
                  {seriesList.length === 0 && (
                    <tr>
                      <Td colSpan={5} className="py-8 text-center text-muted text-sm">
                        No test series assigned to this course yet. Edit any test series and select this course!
                      </Td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card>

          {course.description && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Course Description</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-2">
                {course.description}
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar Column: Course Metadata & Audit Trail */}
        <div className="space-y-6">
          {/* Course Thumbnail Preview Card */}
          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-sm font-semibold text-ink">Course Thumbnail</h3>
              <Link href={`/admin/courses/${id}/edit`} className="text-xs font-semibold text-brand-600 hover:underline">
                Edit Image
              </Link>
            </div>
            {course.thumbnail_url ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-line bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={course.thumbnail_url} alt={course.title} className="size-full object-cover" />
              </div>
            ) : (
              <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface-2/50 text-muted p-4 text-center">
                <svg className="size-8 text-muted/60 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="text-xs text-muted">No thumbnail uploaded</p>
                <Link href={`/admin/courses/${id}/edit`} className="mt-2 text-xs font-semibold text-brand-600 hover:underline">
                  Upload Thumbnail
                </Link>
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-sans text-sm font-semibold text-ink">Course Summary</h3>
            <dl className="divide-y divide-line text-sm">
              <div className="flex justify-between py-2.5">
                <dt className="text-muted">Pricing Type</dt>
                <dd className="font-semibold text-ink">
                  {course.is_free || Number(course.price) === 0 ? 'FREE' : 'PAID'}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-muted">Standard Price</dt>
                <dd className="font-semibold text-ink">
                  {course.is_free || Number(course.price) === 0 ? 'FREE (₹0)' : `₹${course.price}`}
                </dd>
              </div>
              {!(course.is_free || Number(course.price) === 0) && (
                <>
                  <div className="flex justify-between py-2.5">
                    <dt className="text-muted">Discount Price</dt>
                    <dd className="font-semibold text-ok">
                      {course.discount_price ? `₹${course.discount_price}` : 'None'}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <dt className="text-muted">Promo Code</dt>
                    <dd className="font-mono font-semibold text-brand-700">
                      {course.promo_code ?? 'None'}
                    </dd>
                  </div>
                </>
              )}
              <div className="flex justify-between py-2.5">
                <dt className="text-muted">Total Test Series</dt>
                <dd className="font-semibold text-ink">{course.test_series_count}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-muted">Students Enrolled</dt>
                <dd className="font-semibold text-ink">{course.purchase_count}</dd>
              </div>
            </dl>
            <div className="pt-2">
              <ButtonLink href={`/admin/courses/${id}/edit`} variant="secondary" size="md" className="w-full justify-center">
                Edit Pricing & Details
              </ButtonLink>
            </div>
          </Card>

          {/* Audit History */}
          <Card className="p-6">
            <h3 className="font-sans text-sm font-semibold text-ink">Change History</h3>
            <ul className="mt-3 space-y-3 text-xs text-muted">
              {history.map((h) => (
                <li key={h.id} className="border-b border-line/60 pb-2.5 last:border-b-0">
                  <div className="font-medium text-ink">
                    {h.action.replace('COURSE_', '').toLowerCase()}
                  </div>
                  <div className="mt-0.5">
                    {h.admin_name ?? 'System'} · {formatDateTime(h.created_at)}
                  </div>
                </li>
              ))}
              {history.length === 0 && <li>No changes logged yet.</li>}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
