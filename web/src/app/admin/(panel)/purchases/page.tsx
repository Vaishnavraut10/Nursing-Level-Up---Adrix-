import Link from 'next/link';
import { StatusBadge, Table, Td, Th } from '@/components/ui';
import { AdminHeader, FilterBar, Pagination, filterInput, parsePage } from '@/components/admin/shared';
import { listPurchases } from '@/lib/server/services/adminService';
import { formatDateTime, formatMoney } from '@/lib/format';

import { ReconcileButton } from '@/components/admin/ReconcileButton';

export const metadata = { title: 'Purchases & Transactions' };

const STATUSES = ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'];

export default async function PurchasesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const sp = await searchParams;
  const data = await listPurchases({
    page: parsePage(sp.page),
    pageSize: 25,
    q: sp.q?.slice(0, 200) || undefined,
    status: STATUSES.includes(sp.status ?? '') ? sp.status : undefined,
  });
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <AdminHeader title="Purchases & Transactions" description={`Actual Revenue for this view: ${formatMoney(data.summary.revenue)} (successful payments only).`} />
        <ReconcileButton />
      </div>
      <FilterBar action="/admin/purchases">
        <input name="q" defaultValue={sp.q} placeholder="Student, email, order or payment ID" className={`${filterInput} w-72`} aria-label="Search" />
        <select name="status" defaultValue={sp.status ?? ''} className={filterInput} aria-label="Status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
        </select>
      </FilterBar>
      <Table>
        <thead>
          <tr>
            <Th>Student</Th>
            <Th>Course / Item</Th>
            <Th className="text-right">Amount Paid</Th>
            <Th>Promo &amp; Discount</Th>
            <Th>Provider</Th>
            <Th>Order / Payment ID</Th>
            <Th>Status &amp; Access</Th>
            <Th>Date</Th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((p) => (
            <tr key={p.id} className="hover:bg-sunken/40">
              <Td>
                <Link href={`/admin/purchases/${p.id}`} className="font-medium text-ink hover:text-brand-600">{p.user_name}</Link>
                <div className="text-xs text-muted">{p.user_email}</div>
              </Td>
              <Td>
                <div className="font-medium">{p.course_title ?? p.test_title}</div>
                {p.course_id && <div className="text-[11px] text-muted">Course ID: {p.course_id.slice(0, 8)}…</div>}
              </Td>
              <Td className="text-right tabular-nums">
                <div className="font-semibold">{formatMoney(p.amount, p.currency)}</div>
                {p.original_price && Number(p.original_price) > Number(p.amount) && (
                  <div className="text-[11px] text-muted line-through">{formatMoney(p.original_price, p.currency)}</div>
                )}
              </Td>
              <Td>
                {p.promo_code_used ? (
                  <div>
                    <span className="font-mono text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                      {p.promo_code_used}
                    </span>
                    {p.discount_amount ? (
                      <div className="text-[11px] text-ok mt-0.5">-{formatMoney(p.discount_amount, p.currency)} off</div>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-xs text-muted">None</span>
                )}
              </Td>
              <Td>
                <span className="text-xs font-medium">{p.provider}</span>
              </Td>
              <Td className="font-mono text-xs">
                <div>{p.order_id}</div>
                <div className="text-muted">{p.payment_id ?? '—'}</div>
              </Td>
              <Td>
                <div className="flex flex-col gap-1 items-start">
                  <StatusBadge status={p.status} />
                  {p.has_active_access ? (
                    <span className="text-[10px] text-ok font-semibold">✓ Access Active</span>
                  ) : p.status === 'SUCCESS' ? (
                    <span className="text-[10px] text-warn font-semibold">⚠ Missing Access</span>
                  ) : null}
                </div>
              </Td>
              <Td className="whitespace-nowrap">{formatDateTime(p.created_at)}</Td>
            </tr>
          ))}
          {data.items.length === 0 && <tr><Td colSpan={8} className="py-10 text-center text-muted">No purchases match these filters.</Td></tr>}
        </tbody>
      </Table>
      <Pagination base="/admin/purchases" params={sp} page={data.page} totalPages={data.totalPages} total={data.total} />
    </>
  );
}
