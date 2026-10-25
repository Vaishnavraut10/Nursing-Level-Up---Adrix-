import 'server-only';
import { query, queryOne, transaction } from '../db';
import { ApiError, Errors } from '../../errors';
import type { Attempt, Paginated, Purchase, User, UserStatus } from '@/types';
import { logAudit } from './auditService';
import { listForUser as attemptsForUser, progressForUser } from './attemptService';
import { listForUser as purchasesForUser } from './purchaseService';

import { ensureFreeAccessTableExists } from './freeAccessService';

function paginate<T>(items: T[], total: number, page: number, pageSize: number): Paginated<T> {
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function dashboard() {
  await ensureFreeAccessTableExists();
  const stats = await queryOne<Record<string, number>>(
    `WITH valid_free_grants AS (
       SELECT DISTINCT ON (cfa.user_id, cfa.course_id)
              cfa.id,
              cfa.user_id,
              cfa.course_id,
              COALESCE(cfa.price_snapshot, c.price, 0)::float AS grant_value
         FROM course_free_access cfa
         JOIN courses c ON c.id = cfa.course_id
         JOIN users u ON u.id = cfa.user_id
        WHERE cfa.status = 'ACTIVE'
          AND cfa.revoked_at IS NULL
          AND u.email::text NOT LIKE 'deleted_%@deleted.local'
          AND NOT EXISTS (
            SELECT 1 FROM purchases p
             WHERE p.user_id = cfa.user_id
               AND p.course_id = cfa.course_id
               AND p.status = 'SUCCESS'
          )
        ORDER BY cfa.user_id, cfa.course_id, cfa.created_at DESC
     )
     SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'STUDENT' AND email::text NOT LIKE 'deleted_%@deleted.local')::int AS total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'STUDENT' AND created_at > now() - interval '7 days' AND email::text NOT LIKE 'deleted_%@deleted.local')::int AS new_students_7d,
        (SELECT COUNT(*) FROM test_series)::int AS total_test_series,
        (SELECT COUNT(*) FROM test_series WHERE status = 'PUBLISHED')::int AS published_tests,
        (SELECT COUNT(*) FROM test_series WHERE NOT is_free)::int AS paid_tests,
        (SELECT COUNT(*) FROM purchases)::int AS total_purchases,
        (SELECT COUNT(*) FROM purchases WHERE status = 'SUCCESS')::int AS successful_purchases,
        -- Revenue = SUM(successful purchases) only; pending/failed/cancelled/refunded never count (PRD §6.2).
        (SELECT COALESCE(SUM(amount), 0) FROM purchases WHERE status = 'SUCCESS')::float AS revenue,
        (SELECT COUNT(*) FROM attempts)::int AS total_attempts,
        (SELECT COUNT(*) FROM attempts WHERE status = 'COMPLETED')::int AS completed_attempts,
        (SELECT ROUND(AVG(percentage), 2) FROM attempts WHERE status = 'COMPLETED')::float AS average_percentage,
        (SELECT COUNT(*) FROM questions WHERE review_status = 'PENDING_REVIEW')::int AS pending_review,
        -- Free access stats from valid_free_grants (deduped, unrevoked, excluding already-paid)
        (SELECT COUNT(*) FROM valid_free_grants)::int AS free_access_granted,
        (SELECT COALESCE(SUM(grant_value), 0) FROM valid_free_grants)::float AS free_access_value,
        -- Total Business Value = Actual Revenue (cash) + Free Access Value (imputed)
        ((SELECT COALESCE(SUM(amount), 0) FROM purchases WHERE status = 'SUCCESS') +
         (SELECT COALESCE(SUM(grant_value), 0) FROM valid_free_grants))::float AS total_business_value,
        -- Total course access = distinct (user, course) with paid purchase OR active free access, no duplicates
        (SELECT COUNT(*) FROM (
          SELECT user_id, course_id FROM purchases WHERE status = 'SUCCESS' AND course_id IS NOT NULL
          UNION
          SELECT user_id, course_id FROM valid_free_grants
        ) AS all_access)::int AS total_course_access,
        -- Distinct successful paid transactions
        (SELECT COUNT(DISTINCT order_id) FROM purchases WHERE status = 'SUCCESS')::int AS paid_transactions,
        -- Paid course purchases count
        (SELECT COUNT(*) FROM purchases WHERE status = 'SUCCESS' AND course_id IS NOT NULL)::int AS paid_course_purchases,
        -- Promo code purchases
        (SELECT COUNT(*) FROM purchases WHERE status = 'SUCCESS' AND promo_code_used IS NOT NULL)::int AS promo_purchases,
        -- Total discounts given on successful purchases
        (SELECT COALESCE(SUM(GREATEST(0, COALESCE(c.price, 0) - p.amount)), 0)
           FROM purchases p
           JOIN courses c ON c.id = p.course_id
          WHERE p.status = 'SUCCESS' AND p.promo_code_used IS NOT NULL)::float AS discounts_given,
        -- Failed payments
        (SELECT COUNT(*) FROM purchases WHERE status = 'FAILED')::int AS failed_purchases,
        -- Pending/Cancelled payments
        (SELECT COUNT(*) FROM purchases WHERE status IN ('PENDING', 'CANCELLED'))::int AS pending_purchases`,
  );
  const [recentUsers, recentPurchases, recentAttempts] = await Promise.all([
    query<Pick<User, 'id' | 'name' | 'email' | 'created_at'>>(
      `SELECT id, name, email, created_at FROM users WHERE role = 'STUDENT' ORDER BY created_at DESC LIMIT 5`,
    ),
    query<Purchase>(
      `SELECT p.id, p.amount, p.currency, p.status, p.created_at, u.name AS user_name, COALESCE(c.title, ts.title) AS test_title
         FROM purchases p
         JOIN users u ON u.id = p.user_id
         LEFT JOIN test_series ts ON ts.id = p.test_series_id
         LEFT JOIN courses c ON c.id = p.course_id
        ORDER BY p.created_at DESC LIMIT 5`,
    ),
    query<Attempt>(
      `SELECT a.id, a.status, a.percentage, a.score, a.total_questions, a.started_at, a.submitted_at,
              u.name AS user_name, ts.title AS test_title
         FROM attempts a JOIN users u ON u.id = a.user_id JOIN test_series ts ON ts.id = a.test_series_id
        ORDER BY a.started_at DESC LIMIT 5`,
    ),
  ]);
  return { stats: stats!, recentUsers, recentPurchases, recentAttempts };
}

export type AdminUserRow = User & { attempt_count: number; purchase_count: number; last_activity_at: string | null };

export async function listUsers(opts: {
  page: number;
  pageSize: number;
  q?: string;
  role?: 'STUDENT' | 'ADMIN';
  status?: UserStatus;
  profile?: 'complete' | 'incomplete';
}): Promise<Paginated<AdminUserRow>> {
  const where: string[] = ["u.email::text NOT LIKE 'deleted_%@deleted.local'"];
  const params: unknown[] = [];
  if (opts.q) {
    params.push(`%${opts.q}%`);
    where.push(`(u.name ILIKE $${params.length} OR u.email::text ILIKE $${params.length} OR u.phone ILIKE $${params.length})`);
  }
  if (opts.role) {
    params.push(opts.role);
    where.push(`u.role = $${params.length}`);
  }
  if (opts.status) {
    params.push(opts.status);
    where.push(`u.status = $${params.length}`);
  }
  if (opts.profile === 'complete') where.push('u.phone IS NOT NULL');
  if (opts.profile === 'incomplete') where.push('u.phone IS NULL');
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [{ total }] = await query<{ total: number }>(`SELECT COUNT(*)::int AS total FROM users u ${whereSql}`, params);
  params.push(opts.pageSize, (opts.page - 1) * opts.pageSize);
  // Aggregates are joined once per page (no N+1 lookups).
  const items = await query<AdminUserRow>(
    `SELECT u.id, u.google_id, u.name, u.email, u.phone, u.role, u.status, u.created_at, u.updated_at, u.last_login_at,
            COALESCE(a.cnt, 0)::int AS attempt_count, COALESCE(p.cnt, 0)::int AS purchase_count,
            GREATEST(u.last_login_at, a.last_at) AS last_activity_at
       FROM users u
       LEFT JOIN (SELECT user_id, COUNT(*) AS cnt, MAX(started_at) AS last_at FROM attempts GROUP BY user_id) a ON a.user_id = u.id
       LEFT JOIN (SELECT user_id, COUNT(*) AS cnt FROM purchases WHERE status = 'SUCCESS' GROUP BY user_id) p ON p.user_id = u.id
       ${whereSql}
      ORDER BY u.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return paginate(items, total, opts.page, opts.pageSize);
}

export async function userDetail(id: string) {
  const user = await queryOne<User>(
    `SELECT id, google_id, name, email, phone, role, status, created_at, updated_at, last_login_at FROM users WHERE id = $1`,
    [id],
  );
  if (!user || user.email.startsWith('deleted_') && user.email.endsWith('@deleted.local')) {
    throw Errors.notFound('User');
  }
  const [purchases, attempts, progress] = await Promise.all([
    purchasesForUser(id),
    attemptsForUser(id, 100),
    progressForUser(id),
  ]);
  return { user, purchases, attempts, progress };
}

export async function setUserStatus(admin: User, id: string, status: UserStatus) {
  if (admin.id === id) throw Errors.conflict('You cannot change your own account status');
  const row = await queryOne<User>(`UPDATE users SET status = $2 WHERE id = $1 RETURNING id, status, role`, [id, status]);
  if (!row) throw Errors.notFound('User');
  await logAudit(admin.id, 'USER_STATUS_CHANGED', 'user', id, { status });
  return row;
}

export async function deleteUser(admin: User, id: string) {
  if (admin.id === id) {
    throw new ApiError(400, 'BAD_REQUEST', 'You cannot delete your own admin account.');
  }

  return transaction(async (db) => {
    const targetUser = await queryOne<User>(
      `SELECT id, name, email, role, status FROM users WHERE id = $1 FOR UPDATE`,
      [id],
      db,
    );
    if (!targetUser || (targetUser.email.startsWith('deleted_') && targetUser.email.endsWith('@deleted.local'))) {
      throw Errors.notFound('User');
    }
    if (targetUser.role === 'ADMIN') {
      throw new ApiError(400, 'BAD_REQUEST', 'Admin accounts cannot be deleted.');
    }
    if (targetUser.status !== 'SUSPENDED') {
      throw new ApiError(400, 'BAD_REQUEST', 'Only suspended accounts can be deleted.');
    }

    // Clear attempt answers and attempts
    await query(`DELETE FROM user_answers WHERE attempt_id IN (SELECT id FROM attempts WHERE user_id = $1)`, [id], db);
    await query(`DELETE FROM attempts WHERE user_id = $1`, [id], db);

    // Check if user has financial purchase records
    const hasPurchases = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM purchases WHERE user_id = $1`,
      [id],
      db,
    );

    if ((hasPurchases?.count ?? 0) > 0) {
      // Anonymize user identity to preserve payment records while destroying all login credentials
      await query(
        `UPDATE users
            SET name = 'Deleted Student',
                email = $2,
                google_id = NULL,
                password_hash = NULL,
                phone = NULL,
                updated_at = NOW()
          WHERE id = $1`,
        [id, `deleted_${id.replace(/-/g, '')}@deleted.local`],
        db,
      );
    } else {
      // Safely hard delete from users table
      await query(`DELETE FROM users WHERE id = $1`, [id], db);
    }

    await logAudit(admin.id, 'USER_DELETED', 'user', id, {
      deleted_user_email: targetUser.email,
      deleted_user_name: targetUser.name,
    }, db);

    return { deleted: true };
  });
}

export async function listPurchases(opts: {
  page: number;
  pageSize: number;
  q?: string;
  status?: string;
  testSeriesId?: string;
}): Promise<Paginated<Purchase> & { summary: { revenue: number; count: number } }> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.q) {
    params.push(`%${opts.q}%`);
    const n = params.length;
    where.push(`(u.name ILIKE $${n} OR u.email::text ILIKE $${n} OR p.order_id ILIKE $${n} OR p.payment_id ILIKE $${n})`);
  }
  if (opts.status) {
    params.push(opts.status);
    where.push(`p.status = $${params.length}::purchase_status`);
  }
  if (opts.testSeriesId) {
    params.push(opts.testSeriesId);
    where.push(`p.test_series_id = $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const from = `FROM purchases p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN test_series ts ON ts.id = p.test_series_id
    LEFT JOIN courses c ON c.id = p.course_id
    ${whereSql}`;
  const summary = await queryOne<{ total: number; revenue: number }>(
    `SELECT COUNT(*)::int AS total, COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'SUCCESS'), 0)::float AS revenue ${from}`,
    params,
  );
  params.push(opts.pageSize, (opts.page - 1) * opts.pageSize);
  const items = await query<Purchase>(
    `SELECT p.id, p.user_id, p.test_series_id, p.course_id, p.amount, p.currency, p.provider, p.order_id, p.payment_id,
            p.promo_code_used, p.status, p.created_at, p.updated_at,
            u.name AS user_name, u.email AS user_email,
            COALESCE(c.title, ts.title) AS test_title, c.title AS course_title,
            c.price AS original_price,
            CASE WHEN p.promo_code_used IS NOT NULL AND c.price IS NOT NULL
                 THEN GREATEST(0, c.price - p.amount)
                 ELSE 0 END AS discount_amount,
            ((p.status = 'SUCCESS') OR EXISTS (
              SELECT 1 FROM course_free_access cfa
               WHERE cfa.user_id = p.user_id AND cfa.course_id = p.course_id AND cfa.status = 'ACTIVE' AND cfa.revoked_at IS NULL
            )) AS has_active_access
       ${from}
      ORDER BY p.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return {
    ...paginate(items, summary!.total, opts.page, opts.pageSize),
    summary: { revenue: summary!.revenue, count: summary!.total },
  };
}

export async function purchaseDetail(id: string) {
  const purchase = await queryOne<Purchase & { failure_reason: string | null; user_phone: string | null }>(
    `SELECT p.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
            COALESCE(c.title, ts.title) AS test_title, c.title AS course_title,
            c.price AS original_price,
            CASE WHEN p.promo_code_used IS NOT NULL AND c.price IS NOT NULL
                 THEN GREATEST(0, c.price - p.amount)
                 ELSE 0 END AS discount_amount,
            ((p.status = 'SUCCESS') OR EXISTS (
              SELECT 1 FROM course_free_access cfa
               WHERE cfa.user_id = p.user_id AND cfa.course_id = p.course_id AND cfa.status = 'ACTIVE' AND cfa.revoked_at IS NULL
            )) AS has_active_access
       FROM purchases p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN test_series ts ON ts.id = p.test_series_id
       LEFT JOIN courses c ON c.id = p.course_id
      WHERE p.id = $1`,
    [id],
  );
  if (!purchase) throw Errors.notFound('Purchase');
  const events = await query<{ id: string; event_type: string; created_at: string }>(
    `SELECT id, event_type, created_at FROM payment_events WHERE order_id = $1 ORDER BY created_at`,
    [purchase.order_id],
  );
  return { purchase, events };
}

export interface ReconcileResult {
  dryRun: boolean;
  totalChecked: number;
  repairedCount: number;
  candidates: {
    purchaseId: string;
    userId: string;
    userEmail: string;
    orderId: string;
    paymentId: string | null;
    currentStatus: string;
    verifiedEventType?: string;
    issue: string;
    action: string;
  }[];
  unassignedTests: { id: string; title: string }[];
}

import { fetchOrderPayments } from '../razorpay';
import { markSuccess } from './purchaseService';

/**
 * Reconciles transactions safely against verified stored payment events and live Razorpay gateway verification.
 * Only upgrades to SUCCESS if Razorpay confirmed capture/payment and the captured amount matches.
 * Never grants access for failed, unverified, or cancelled payments without captured funds.
 */
export async function reconcilePurchases(adminId: string, dryRun: boolean = true): Promise<ReconcileResult> {
  const allPurchases = await query<Purchase & { user_email: string; failure_reason: string | null }>(
    `SELECT p.*, u.email AS user_email
       FROM purchases p
       JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC`,
  );

  const candidates: ReconcileResult['candidates'] = [];
  let repairedCount = 0;

  for (const p of allPurchases) {
    if (p.status !== 'SUCCESS') {
      // 1. Check if there is a verified captured webhook event for this order
      const capturedEvent = await queryOne<{ event_type: string; payment_id: string }>(
        `SELECT event_type, payment_id FROM payment_events
          WHERE order_id = $1 AND event_type IN ('payment.captured', 'order.paid')
          ORDER BY created_at DESC LIMIT 1`,
        [p.order_id],
      );

      let verifiedPaymentId: string | null = null;
      let verificationSource = '';

      if (capturedEvent) {
        verifiedPaymentId = capturedEvent.payment_id || p.payment_id || `pay_${p.order_id.replace(/^order_/, '')}`;
        verificationSource = `webhook ${capturedEvent.event_type}`;
      } else if (p.order_id && p.order_id.startsWith('order_')) {
        // 2. Query Razorpay API directly for missed webhooks
        try {
          const payments = await fetchOrderPayments(p.order_id);
          const captured = payments.find((x) => x.status === 'captured');
          if (captured) {
            const expectedPaise = Math.round(Number(p.amount) * 100);
            if (captured.amount === expectedPaise) {
              verifiedPaymentId = captured.id;
              verificationSource = `Razorpay API captured (${captured.id})`;
            }
          }
        } catch (err) {
          console.error('[reconcile] error querying razorpay for order', p.order_id, err);
        }
      }

      if (verifiedPaymentId) {
        candidates.push({
          purchaseId: p.id,
          userId: p.user_id,
          userEmail: p.user_email,
          orderId: p.order_id,
          paymentId: verifiedPaymentId,
          currentStatus: p.status,
          verifiedEventType: verificationSource,
          issue: `Payment verified by ${verificationSource} but purchase status in DB is ${p.status}`,
          action: dryRun ? 'Would upgrade to SUCCESS and grant course enrollment' : 'Upgraded to SUCCESS and enrolled in course',
        });

        if (!dryRun) {
          await markSuccess(p.order_id, verifiedPaymentId);
          await query(
            `INSERT INTO payment_events (provider, event_id, event_type, order_id, payment_id, payload)
             VALUES ('RAZORPAY', $1, 'reconcile.payment_captured', $2, $3, $4)
             ON CONFLICT (event_id) DO NOTHING`,
            [`reconcile_${verifiedPaymentId}`, p.order_id, verifiedPaymentId, { reconciled_by: adminId, source: verificationSource }],
          );
          await logAudit(adminId, 'RECONCILE_PAYMENT' as any, 'purchase', p.id, {
            order_id: p.order_id,
            payment_id: verifiedPaymentId,
            previous_status: p.status,
            reason: `Reconciled from ${verificationSource}`,
          });
          repairedCount++;
        }
      }
    }
  }

  // Also audit any unassigned test series
  const unassigned = await query<{ id: string; title: string }>(
    `SELECT id, title FROM test_series WHERE course_id IS NULL AND status = 'PUBLISHED'`,
  );

  return {
    dryRun,
    totalChecked: allPurchases.length,
    repairedCount,
    candidates,
    unassignedTests: unassigned,
  };
}

export async function listAttempts(opts: {
  page: number;
  pageSize: number;
  q?: string;
  status?: string;
  testSeriesId?: string;
  userId?: string;
}): Promise<Paginated<Attempt>> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.q) {
    params.push(`%${opts.q}%`);
    const n = params.length;
    where.push(`(u.name ILIKE $${n} OR u.email::text ILIKE $${n} OR ts.title ILIKE $${n})`);
  }
  if (opts.status) {
    params.push(opts.status);
    where.push(`a.status = $${params.length}::attempt_status`);
  }
  if (opts.testSeriesId) {
    params.push(opts.testSeriesId);
    where.push(`a.test_series_id = $${params.length}`);
  }
  if (opts.userId) {
    params.push(opts.userId);
    where.push(`a.user_id = $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const from = `FROM attempts a JOIN users u ON u.id = a.user_id JOIN test_series ts ON ts.id = a.test_series_id ${whereSql}`;
  const [{ total }] = await query<{ total: number }>(`SELECT COUNT(*)::int AS total ${from}`, params);
  params.push(opts.pageSize, (opts.page - 1) * opts.pageSize);
  const items = await query<Attempt>(
    `SELECT a.id, a.user_id, a.test_series_id, a.started_at, a.submitted_at, a.score, a.total_questions,
            a.correct_answers, a.incorrect_answers, a.unanswered, a.percentage, a.time_taken_seconds, a.status,
            u.name AS user_name, u.email AS user_email, ts.title AS test_title
       ${from}
      ORDER BY a.started_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return paginate(items, total, opts.page, opts.pageSize);
}
