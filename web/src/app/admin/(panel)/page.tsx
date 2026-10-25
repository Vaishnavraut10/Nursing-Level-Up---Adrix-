import Link from 'next/link';
import { Card, Stat, StatusBadge } from '@/components/ui';
import { AdminHeader } from '@/components/admin/shared';
import { dashboard } from '@/lib/server/services/adminService';
import { formatDate, formatDateTime, formatMoney, formatPercent } from '@/lib/format';

export const metadata = { title: 'Dashboard' };

export default async function AdminDashboard() {
  const { stats, recentUsers, recentPurchases, recentAttempts } = await dashboard();
  return (
    <>
      <AdminHeader
        title="Dashboard"
        description="Platform overview. Actual Revenue counts successful payments only. Free Access Value is the imputed regular price of admin-granted free access. Total Business Value combines actual revenue and free access value."
      />
      {stats.pending_review > 0 && (
        <Link href="/admin/questions" className="mb-6 block rounded-card border border-warn/30 bg-warn-50 px-4 py-3 text-sm text-warn hover:brightness-[0.98]">
          <strong>{stats.pending_review}</strong> AI-generated question{stats.pending_review === 1 ? '' : 's'} awaiting review →
        </Link>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Stat
          label="Total Business Value"
          value={formatMoney(stats.total_business_value)}
          hint={`${formatMoney(stats.revenue)} revenue + ${formatMoney(stats.free_access_value)} grants`}
        />
        <Stat
          label="Actual Revenue"
          value={formatMoney(stats.revenue)}
          hint={`${stats.paid_transactions} paid transactions (cash collected)`}
        />
        <Stat
          label="Free Access Value"
          value={formatMoney(stats.free_access_value)}
          hint={`${stats.free_access_granted} active grants (imputed regular price)`}
        />
        <Stat
          label="Free Access Granted"
          value={stats.free_access_granted}
          hint={`Imputed value: ${formatMoney(stats.free_access_value)}`}
        />
        <Stat
          label="Total Course Access"
          value={stats.total_course_access}
          hint={`${stats.paid_course_purchases} paid + ${stats.free_access_granted} free (deduped)`}
        />
        <Stat
          label="Paid Course Purchases"
          value={stats.paid_course_purchases}
          hint="Successful verified payments"
        />
        <Stat
          label="Students"
          value={stats.total_students}
          hint={`+${stats.new_students_7d} in the last 7 days`}
        />
        <Stat
          label="Promo Purchases"
          value={stats.promo_purchases}
          hint={`${formatMoney(stats.discounts_given)} total discounts given`}
        />
        <Stat
          label="Payment Exceptions"
          value={stats.failed_purchases + stats.pending_purchases}
          hint={`${stats.failed_purchases} failed · ${stats.pending_purchases} pending/abandoned`}
        />
        <Stat
          label="Test Series / Attempts"
          value={stats.total_test_series}
          hint={`${stats.total_attempts} attempts · avg ${formatPercent(stats.average_percentage)}`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="p-5">
          <PanelTitle title="Recent registrations" href="/admin/users" />
          <ul className="divide-y divide-line text-sm">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/admin/users/${u.id}`} className="min-w-0">
                  <div className="truncate font-medium text-ink hover:text-brand-600">{u.name}</div>
                  <div className="truncate text-xs text-muted">{u.email}</div>
                </Link>
                <span className="shrink-0 text-xs text-muted">{formatDate(u.created_at)}</span>
              </li>
            ))}
            {recentUsers.length === 0 && <li className="py-6 text-center text-muted">No students yet</li>}
          </ul>
        </Card>
        <Card className="p-5">
          <PanelTitle title="Recent purchases" href="/admin/purchases" />
          <ul className="divide-y divide-line text-sm">
            {recentPurchases.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/admin/purchases/${p.id}`} className="min-w-0">
                  <div className="truncate font-medium text-ink hover:text-brand-600">{p.user_name}</div>
                  <div className="truncate text-xs text-muted">{p.test_title}</div>
                </Link>
                <div className="shrink-0 text-right">
                  <div className="tabular-nums">{formatMoney(p.amount, p.currency)}</div>
                  <StatusBadge status={p.status} />
                </div>
              </li>
            ))}
            {recentPurchases.length === 0 && <li className="py-6 text-center text-muted">No purchases yet</li>}
          </ul>
        </Card>
        <Card className="p-5">
          <PanelTitle title="Recent attempts" href="/admin/attempts" />
          <ul className="divide-y divide-line text-sm">
            {recentAttempts.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/admin/attempts/${a.id}`} className="min-w-0">
                  <div className="truncate font-medium text-ink hover:text-brand-600">{a.user_name}</div>
                  <div className="truncate text-xs text-muted">{a.test_title} · {formatDateTime(a.started_at)}</div>
                </Link>
                <div className="shrink-0">{a.status === 'COMPLETED' ? <span className="tabular-nums">{formatPercent(a.percentage)}</span> : <StatusBadge status={a.status} />}</div>
              </li>
            ))}
            {recentAttempts.length === 0 && <li className="py-6 text-center text-muted">No attempts yet</li>}
          </ul>
        </Card>
      </div>
    </>
  );
}

function PanelTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="font-sans text-sm font-semibold">{title}</h2>
      <Link href={href} className="text-xs font-medium text-brand-600 hover:underline">View all</Link>
    </div>
  );
}
