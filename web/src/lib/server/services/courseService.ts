import 'server-only';
import { query, queryOne, transaction } from '../db';
import { Errors } from '../../errors';
import type { Course, CourseStatus, Paginated, User, PromoCode } from '@/types';
import { logAudit } from './auditService';
import { validatePromoCodeDetails } from './promoCodeService';
import { uuidSchema } from '../../validation';

const COURSE_COLUMNS = `c.id, c.title, c.description, c.price, c.discount_price, c.promo_code,
  c.currency, c.status, c.is_free, c.thumbnail_key, c.created_by, c.created_at, c.updated_at`;

const PUBLIC_COURSE_COLUMNS = `c.id, c.title, c.description, c.price, c.discount_price, NULL AS promo_code,
  c.currency, c.status, c.is_free, c.thumbnail_key, c.created_by, c.created_at, c.updated_at`;

export function withThumbnailUrl<T extends Course>(course: T): T {
  const v = course.updated_at ? new Date(course.updated_at).getTime() : Date.now();
  return {
    ...course,
    thumbnail_url: course.thumbnail_key ? `/api/courses/${course.id}/thumbnail?v=${v}` : null,
  };
}

// ---- Public queries ----

/** Returns all published courses (both Paid and Free) for the student catalog. */
export async function listPublishedCourses(): Promise<Course[]> {
  const rows = await query<Course>(
    `SELECT ${PUBLIC_COURSE_COLUMNS} FROM courses c WHERE c.status = 'PUBLISHED' ORDER BY c.updated_at DESC, c.created_at DESC`,
  );
  return rows.map(withThumbnailUrl);
}

/** Returns the active published course (by id if provided, else most recently updated/created published course). Hidden promo_code for students. */
export async function getPublishedCourse(courseId?: string): Promise<Course | null> {
  if (courseId) {
    if (!uuidSchema.safeParse(courseId).success) return null;
    const row = await queryOne<Course>(
      `SELECT ${PUBLIC_COURSE_COLUMNS} FROM courses c WHERE c.id = $1 AND c.status = 'PUBLISHED'`,
      [courseId],
    );
    return row ? withThumbnailUrl(row) : null;
  }
  const row = await queryOne<Course>(
    `SELECT ${PUBLIC_COURSE_COLUMNS} FROM courses c WHERE c.status = 'PUBLISHED' ORDER BY c.updated_at DESC, c.created_at DESC LIMIT 1`,
  );
  return row ? withThumbnailUrl(row) : null;
}

export async function getById(id: string): Promise<Course | null> {
  if (!uuidSchema.safeParse(id).success) return null;
  const row = await queryOne<Course>(`SELECT ${PUBLIC_COURSE_COLUMNS} FROM courses c WHERE c.id = $1`, [id]);
  return row ? withThumbnailUrl(row) : null;
}

import { hasActiveFreeAccess } from './freeAccessService';

// ---- Access checks ----

/** Returns true if the user has a successful course purchase, active free access grant, or if the course is free. */
export async function hasCoursePurchase(userId: string, courseId: string): Promise<boolean> {
  if (!uuidSchema.safeParse(userId).success || !uuidSchema.safeParse(courseId).success) {
    return false;
  }
  const course = await queryOne<{ is_free: boolean; price: number }>(
    `SELECT is_free, price FROM courses WHERE id = $1`,
    [courseId],
  );
  if (course && (course.is_free || Number(course.price) === 0)) {
    return true;
  }
  const row = await queryOne(
    `SELECT 1 FROM purchases WHERE user_id = $1 AND course_id = $2 AND status = 'SUCCESS' LIMIT 1`,
    [userId, courseId],
  );
  if (row !== null) return true;

  if (await hasActiveFreeAccess(userId, courseId)) return true;

  // Self-healing check: If student has a recent order that was captured on Razorpay, sync and verify it
  const unverified = await queryOne<{ order_id: string }>(
    `SELECT order_id FROM purchases
      WHERE user_id = $1 AND course_id = $2 AND status IN ('PENDING', 'CANCELLED')
      ORDER BY created_at DESC LIMIT 1`,
    [userId, courseId],
  );
  if (unverified?.order_id && unverified.order_id.startsWith('order_')) {
    try {
      const { syncOrderWithGateway } = await import('./purchaseService');
      const synced = await syncOrderWithGateway(unverified.order_id, userId);
      if (synced?.status === 'SUCCESS') return true;
    } catch (err) {
      console.error('[hasCoursePurchase] gateway sync fallback error', err);
    }
  }

  return false;
}

/** Returns the earliest successful course purchase date or free access grant date (access_started_at for drip schedule). */
export async function getAccessStartedAt(userId: string, courseId: string): Promise<Date | null> {
  if (!uuidSchema.safeParse(userId).success || !uuidSchema.safeParse(courseId).success) {
    return null;
  }
  const row = await queryOne<{ access_started_at: string }>(
    `SELECT MIN(created_at) AS access_started_at FROM purchases
     WHERE user_id = $1 AND course_id = $2 AND status = 'SUCCESS'`,
    [userId, courseId],
  );
  if (row?.access_started_at) {
    return new Date(row.access_started_at);
  }
  const grant = await queryOne<{ granted_at: string }>(
    `SELECT granted_at FROM course_free_access
     WHERE user_id = $1 AND course_id = $2 AND status = 'ACTIVE' AND revoked_at IS NULL ORDER BY granted_at ASC LIMIT 1`,
    [userId, courseId],
  );
  if (grant?.granted_at) {
    return new Date(grant.granted_at);
  }
  const course = await queryOne<{ created_at: string; is_free: boolean; price: number }>(
    `SELECT created_at, is_free, price FROM courses WHERE id = $1`,
    [courseId],
  );
  if (course && (course.is_free || Number(course.price) === 0)) {
    return new Date(course.created_at);
  }
  return null;
}

/** Validate a promo code against the database and return the discounted price. Returns null if invalid. */
export async function validatePromoCode(courseOrId: Course | string, code: string, userId?: string): Promise<number | null> {
  const courseId = typeof courseOrId === 'string' ? courseOrId : courseOrId.id;
  const result = await validatePromoCodeDetails(courseId, code, userId);
  return result.valid ? result.discountedPrice : null;
}

// ---- Admin CRUD ----

export async function adminList(opts: {
  page: number;
  pageSize: number;
  q?: string;
  status?: CourseStatus;
}): Promise<Paginated<Course & { test_series_count: number; purchase_count: number; revenue: number; free_access_count: number; free_access_value: number; total_access: number }>> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.q) {
    params.push(`%${opts.q}%`);
    where.push(`c.title ILIKE $${params.length}`);
  }
  if (opts.status) {
    params.push(opts.status);
    where.push(`c.status = $${params.length}::course_status`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [{ total }] = await query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM courses c ${whereSql}`, params,
  );
  params.push(opts.pageSize, (opts.page - 1) * opts.pageSize);
  const rows = await query<Course & { test_series_count: number; purchase_count: number; revenue: number; free_access_count: number; free_access_value: number; total_access: number }>(
    `SELECT ${COURSE_COLUMNS},
            (SELECT COUNT(*) FROM test_series ts WHERE ts.course_id = c.id)::int AS test_series_count,
            (SELECT COUNT(*) FROM purchases p WHERE p.course_id = c.id AND p.status = 'SUCCESS')::int AS purchase_count,
            (SELECT COALESCE(SUM(p.amount), 0) FROM purchases p WHERE p.course_id = c.id AND p.status = 'SUCCESS') AS revenue,
            (SELECT COUNT(*) FROM course_free_access cfa WHERE cfa.course_id = c.id AND cfa.status = 'ACTIVE' AND cfa.revoked_at IS NULL AND NOT EXISTS (SELECT 1 FROM purchases p WHERE p.user_id = cfa.user_id AND p.course_id = c.id AND p.status = 'SUCCESS'))::int AS free_access_count,
            (SELECT COALESCE(SUM(COALESCE(cfa.price_snapshot, c.price)), 0) FROM course_free_access cfa WHERE cfa.course_id = c.id AND cfa.status = 'ACTIVE' AND cfa.revoked_at IS NULL AND NOT EXISTS (SELECT 1 FROM purchases p WHERE p.user_id = cfa.user_id AND p.course_id = c.id AND p.status = 'SUCCESS'))::float AS free_access_value,
            (SELECT COUNT(*) FROM (
              SELECT user_id FROM purchases p2 WHERE p2.course_id = c.id AND p2.status = 'SUCCESS'
              UNION
              SELECT user_id FROM course_free_access cfa2 WHERE cfa2.course_id = c.id AND cfa2.status = 'ACTIVE' AND cfa2.revoked_at IS NULL
            ) AS acc)::int AS total_access
       FROM courses c ${whereSql}
      ORDER BY c.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  const items = rows.map(withThumbnailUrl);
  return { items, page: opts.page, pageSize: opts.pageSize, total, totalPages: Math.max(1, Math.ceil(total / opts.pageSize)) };
}

export async function adminGet(id: string) {
  if (!uuidSchema.safeParse(id).success) throw Errors.notFound('Course');
  const row = await queryOne<Course & { test_series_count: number; purchase_count: number; revenue: number; free_access_count: number; free_access_value: number; total_access: number }>(
    `SELECT ${COURSE_COLUMNS},
            (SELECT COUNT(*) FROM test_series ts WHERE ts.course_id = c.id)::int AS test_series_count,
            (SELECT COUNT(*) FROM purchases p WHERE p.course_id = c.id AND p.status = 'SUCCESS')::int AS purchase_count,
            (SELECT COALESCE(SUM(p.amount), 0) FROM purchases p WHERE p.course_id = c.id AND p.status = 'SUCCESS') AS revenue,
            (SELECT COUNT(*) FROM course_free_access cfa WHERE cfa.course_id = c.id AND cfa.status = 'ACTIVE' AND cfa.revoked_at IS NULL AND NOT EXISTS (SELECT 1 FROM purchases p WHERE p.user_id = cfa.user_id AND p.course_id = c.id AND p.status = 'SUCCESS'))::int AS free_access_count,
            (SELECT COALESCE(SUM(COALESCE(cfa.price_snapshot, c.price)), 0) FROM course_free_access cfa WHERE cfa.course_id = c.id AND cfa.status = 'ACTIVE' AND cfa.revoked_at IS NULL AND NOT EXISTS (SELECT 1 FROM purchases p WHERE p.user_id = cfa.user_id AND p.course_id = c.id AND p.status = 'SUCCESS'))::float AS free_access_value,
            (SELECT COUNT(*) FROM (
              SELECT user_id FROM purchases p2 WHERE p2.course_id = c.id AND p2.status = 'SUCCESS'
              UNION
              SELECT user_id FROM course_free_access cfa2 WHERE cfa2.course_id = c.id AND cfa2.status = 'ACTIVE' AND cfa2.revoked_at IS NULL
            ) AS acc)::int AS total_access
       FROM courses c WHERE c.id = $1`,
    [id],
  );
  if (!row) throw Errors.notFound('Course');

  const promoCodes = await query<PromoCode>(
    `SELECT id, course_id, code, discount_type, discount_value, discount_price, max_uses, per_user_limit,
            expires_at, is_active, usage_count, created_at, updated_at
       FROM promo_codes
      WHERE course_id = $1
      ORDER BY created_at ASC`,
    [id],
  );

  const course = withThumbnailUrl(row);
  return {
    ...course,
    promo_codes: promoCodes,
  };
}

export interface CoursePromoItemInput {
  id?: string | null;
  code: string;
  discount_price?: number | null;
  discount_type?: 'FIXED' | 'PERCENTAGE';
  discount_value?: number;
  is_active?: boolean;
}

export interface CourseInput {
  title: string;
  description?: string | null;
  price: number;
  discount_price?: number | null;
  promo_code?: string | null;
  currency?: string;
  status?: CourseStatus;
  is_free?: boolean;
  promo_codes?: CoursePromoItemInput[];
}

export async function create(input: CourseInput, admin: User) {
  const isFree = input.is_free ?? (input.price === 0);
  const price = isFree ? 0 : input.price;

  const primaryPromo = input.promo_codes && input.promo_codes.length > 0
    ? (input.promo_codes.find(p => p.is_active !== false) || input.promo_codes[0])
    : null;

  const promoCode = isFree
    ? null
    : (primaryPromo ? primaryPromo.code.trim().toUpperCase() : (input.promo_code?.toUpperCase() ?? null));

  const discountPrice = isFree
    ? null
    : (primaryPromo && primaryPromo.discount_price !== undefined && primaryPromo.discount_price !== null
        ? Number(primaryPromo.discount_price)
        : (input.discount_price ?? null));

  return transaction(async (db) => {
    const row = await queryOne<{ id: string }>(
      `INSERT INTO courses (title, description, price, discount_price, promo_code, currency, status, is_free, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [input.title, input.description ?? null, price, discountPrice,
       promoCode, input.currency ?? 'INR', input.status ?? 'DRAFT', isFree, admin.id],
      db,
    );
    const courseId = row!.id;

    if (!isFree && input.promo_codes && input.promo_codes.length > 0) {
      for (const p of input.promo_codes) {
        const pCode = p.code.trim().toUpperCase();
        if (!pCode) continue;
        const pDiscountPrice = p.discount_price !== undefined && p.discount_price !== null
          ? Math.max(0, Number(p.discount_price))
          : (price - (p.discount_value ?? 0));
        const pDiscountValue = Math.max(0, price - pDiscountPrice);
        const pIsActive = p.is_active !== false;

        await query(
          `INSERT INTO promo_codes (course_id, code, discount_type, discount_value, discount_price, is_active)
           VALUES ($1, $2, 'FIXED', $3, $4, $5)
           ON CONFLICT (course_id, code) DO UPDATE
           SET discount_price = EXCLUDED.discount_price,
               discount_value = EXCLUDED.discount_value,
               is_active = EXCLUDED.is_active,
               updated_at = NOW()`,
          [courseId, pCode, pDiscountValue, pDiscountPrice, pIsActive],
          db,
        );
      }
    }

    await logAudit(admin.id, 'COURSE_CREATED', 'course', courseId, { title: input.title }, db);
    return courseId;
  });
}

export async function update(id: string, input: CourseInput, admin: User) {
  const isFree = input.is_free ?? (input.price === 0);
  const price = isFree ? 0 : input.price;

  const primaryPromo = input.promo_codes && input.promo_codes.length > 0
    ? (input.promo_codes.find(p => p.is_active !== false) || input.promo_codes[0])
    : null;

  const promoCode = isFree
    ? null
    : (primaryPromo ? primaryPromo.code.trim().toUpperCase() : (input.promo_code?.toUpperCase() ?? null));

  const discountPrice = isFree
    ? null
    : (primaryPromo && primaryPromo.discount_price !== undefined && primaryPromo.discount_price !== null
        ? Number(primaryPromo.discount_price)
        : (input.discount_price ?? null));

  return transaction(async (db) => {
    const existing = await queryOne<{ id: string }>(`SELECT id FROM courses WHERE id = $1 FOR UPDATE`, [id], db);
    if (!existing) throw Errors.notFound('Course');
    await query(
      `UPDATE courses SET title = $2, description = $3, price = $4, discount_price = $5,
              promo_code = $6, currency = $7, status = $8, is_free = $9
        WHERE id = $1`,
      [id, input.title, input.description ?? null, price, discountPrice,
       promoCode, input.currency ?? 'INR', input.status ?? 'DRAFT', isFree],
      db,
    );

    // Sync promo codes if input.promo_codes is provided and course is not free
    if (!isFree && input.promo_codes !== undefined) {
      const incomingIds = input.promo_codes.map(p => p.id).filter((item): item is string => !!item);
      if (incomingIds.length > 0) {
        await query(
          `DELETE FROM promo_codes WHERE course_id = $1 AND id NOT IN (${incomingIds.map((_, i) => `$${i + 2}`).join(',')})`,
          [id, ...incomingIds],
          db,
        );
      } else {
        await query(`DELETE FROM promo_codes WHERE course_id = $1`, [id], db);
      }

      for (const p of input.promo_codes) {
        const pCode = p.code.trim().toUpperCase();
        if (!pCode) continue;
        const pDiscountPrice = p.discount_price !== undefined && p.discount_price !== null
          ? Math.max(0, Number(p.discount_price))
          : (price - (p.discount_value ?? 0));
        const pDiscountValue = Math.max(0, price - pDiscountPrice);
        const pIsActive = p.is_active !== false;

        if (p.id) {
          await query(
            `UPDATE promo_codes
                SET code = $2, discount_type = 'FIXED', discount_value = $3, discount_price = $4,
                    is_active = $5, updated_at = NOW()
              WHERE id = $1 AND course_id = $6`,
            [p.id, pCode, pDiscountValue, pDiscountPrice, pIsActive, id],
            db,
          );
        } else {
          await query(
            `INSERT INTO promo_codes (course_id, code, discount_type, discount_value, discount_price, is_active)
             VALUES ($1, $2, 'FIXED', $3, $4, $5)
             ON CONFLICT (course_id, code) DO UPDATE
             SET discount_price = EXCLUDED.discount_price,
                 discount_value = EXCLUDED.discount_value,
                 is_active = EXCLUDED.is_active,
                 updated_at = NOW()`,
            [id, pCode, pDiscountValue, pDiscountPrice, pIsActive],
            db,
          );
        }
      }
    }

    await logAudit(admin.id, 'COURSE_UPDATED', 'course', id, { fields: Object.keys(input) }, db);
  });
}

export async function updateThumbnailKey(id: string, key: string | null, admin: User) {
  return transaction(async (db) => {
    const existing = await queryOne<{ thumbnail_key: string | null }>(`SELECT thumbnail_key FROM courses WHERE id = $1 FOR UPDATE`, [id], db);
    if (!existing) throw Errors.notFound('Course');
    await query(`UPDATE courses SET thumbnail_key = $2 WHERE id = $1`, [id, key], db);
    await logAudit(admin.id, key ? 'COURSE_THUMBNAIL_UPDATED' : 'COURSE_THUMBNAIL_REMOVED', 'course', id, { key }, db);
    return existing.thumbnail_key;
  });
}

export async function publish(id: string, admin: User) {
  return transaction(async (db) => {
    const row = await queryOne<{ id: string }>(
      `UPDATE courses SET status = 'PUBLISHED' WHERE id = $1 RETURNING id`,
      [id],
      db,
    );
    if (!row) throw Errors.notFound('Course');
    await logAudit(admin.id, 'COURSE_PUBLISHED', 'course', id, {}, db);
    return row;
  });
}

export async function unpublish(id: string, admin: User) {
  return transaction(async (db) => {
    const row = await queryOne<{ id: string }>(
      `UPDATE courses SET status = 'DRAFT' WHERE id = $1 RETURNING id`,
      [id],
      db,
    );
    if (!row) throw Errors.notFound('Course');
    await logAudit(admin.id, 'COURSE_UNPUBLISHED', 'course', id, {}, db);
    return row;
  });
}

export async function archive(id: string, admin: User) {
  return transaction(async (db) => {
    const row = await queryOne<{ id: string }>(
      `UPDATE courses SET status = 'ARCHIVED' WHERE id = $1 RETURNING id`,
      [id],
      db,
    );
    if (!row) throw Errors.notFound('Course');
    await logAudit(admin.id, 'COURSE_ARCHIVED', 'course', id, {}, db);
    return row;
  });
}

export async function remove(id: string, admin: User) {
  return transaction(async (db) => {
    const row = await queryOne<{ id: string }>(
      `UPDATE courses SET status = 'DELETED', deleted_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING id`,
      [id],
      db,
    );
    if (!row) throw Errors.notFound('Course');
    // Cascade soft-unpublish/archive assigned test series so they are hidden from students
    await query(
      `UPDATE test_series SET status = 'ARCHIVED', updated_at = NOW() WHERE course_id = $1 AND status = 'PUBLISHED'`,
      [id],
      db,
    );
    await logAudit(admin.id, 'COURSE_DELETED', 'course', id, {}, db);
    return row;
  });
}

export async function listAllForSelect(): Promise<Pick<Course, 'id' | 'title' | 'status'>[]> {
  return query<Pick<Course, 'id' | 'title' | 'status'>>(
    `SELECT id, title, status FROM courses ORDER BY title ASC`,
  );
}

export async function getCourseTestSeries(courseId: string) {
  return query<{
    id: string;
    title: string;
    status: string;
    is_free: boolean;
    release_after_days: number;
    question_count: number;
  }>(
    `SELECT ts.id, ts.title, ts.status, ts.is_free, ts.release_after_days,
            (SELECT COUNT(*) FROM questions q WHERE q.test_series_id = ts.id AND q.review_status = 'APPROVED')::int AS question_count
       FROM test_series ts
      WHERE ts.course_id = $1
      ORDER BY ts.release_after_days ASC, ts.title ASC`,
    [courseId],
  );
}

