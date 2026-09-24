import 'server-only';
import { query, queryOne, transaction } from '../db';
import { Errors } from '../../errors';
import type { Course, CourseStatus, Paginated, User } from '@/types';
import { logAudit } from './auditService';

const COURSE_COLUMNS = `c.id, c.title, c.description, c.price, c.discount_price, c.promo_code,
  c.currency, c.status, c.created_by, c.created_at, c.updated_at`;

// ---- Public queries ----

/** Returns the published course (currently one course, but supports multiple). */
export async function getPublishedCourse(): Promise<Course | null> {
  return queryOne<Course>(
    `SELECT ${COURSE_COLUMNS} FROM courses c WHERE c.status = 'PUBLISHED' ORDER BY c.created_at LIMIT 1`,
  );
}

export async function getById(id: string): Promise<Course | null> {
  return queryOne<Course>(`SELECT ${COURSE_COLUMNS} FROM courses c WHERE c.id = $1`, [id]);
}

// ---- Access checks ----

/** Returns true if the user has a successful course purchase. */
export async function hasCoursePurchase(userId: string, courseId: string): Promise<boolean> {
  const row = await queryOne(
    `SELECT 1 FROM purchases WHERE user_id = $1 AND course_id = $2 AND status = 'SUCCESS' LIMIT 1`,
    [userId, courseId],
  );
  return row !== null;
}

/** Returns the earliest successful course purchase date (access_started_at for drip schedule). */
export async function getAccessStartedAt(userId: string, courseId: string): Promise<Date | null> {
  const row = await queryOne<{ access_started_at: string }>(
    `SELECT MIN(created_at) AS access_started_at FROM purchases
     WHERE user_id = $1 AND course_id = $2 AND status = 'SUCCESS'`,
    [userId, courseId],
  );
  return row?.access_started_at ? new Date(row.access_started_at) : null;
}

/** Validate a promo code and return the discounted price. Returns null if invalid. */
export function validatePromoCode(course: Course, code: string): number | null {
  if (!course.promo_code || !course.discount_price) return null;
  if (code.trim().toUpperCase() !== course.promo_code.toUpperCase()) return null;
  return course.discount_price;
}

// ---- Admin CRUD ----

export async function adminList(opts: {
  page: number;
  pageSize: number;
  q?: string;
  status?: CourseStatus;
}): Promise<Paginated<Course & { test_series_count: number; purchase_count: number; revenue: number }>> {
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
  const items = await query<Course & { test_series_count: number; purchase_count: number; revenue: number }>(
    `SELECT ${COURSE_COLUMNS},
            (SELECT COUNT(*) FROM test_series ts WHERE ts.course_id = c.id)::int AS test_series_count,
            (SELECT COUNT(*) FROM purchases p WHERE p.course_id = c.id AND p.status = 'SUCCESS')::int AS purchase_count,
            (SELECT COALESCE(SUM(p.amount), 0) FROM purchases p WHERE p.course_id = c.id AND p.status = 'SUCCESS') AS revenue
       FROM courses c ${whereSql}
      ORDER BY c.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return { items, page: opts.page, pageSize: opts.pageSize, total, totalPages: Math.max(1, Math.ceil(total / opts.pageSize)) };
}

export async function adminGet(id: string) {
  const row = await queryOne<Course & { test_series_count: number; purchase_count: number; revenue: number }>(
    `SELECT ${COURSE_COLUMNS},
            (SELECT COUNT(*) FROM test_series ts WHERE ts.course_id = c.id)::int AS test_series_count,
            (SELECT COUNT(*) FROM purchases p WHERE p.course_id = c.id AND p.status = 'SUCCESS')::int AS purchase_count,
            (SELECT COALESCE(SUM(p.amount), 0) FROM purchases p WHERE p.course_id = c.id AND p.status = 'SUCCESS') AS revenue
       FROM courses c WHERE c.id = $1`,
    [id],
  );
  if (!row) throw Errors.notFound('Course');
  return row;
}

export interface CourseInput {
  title: string;
  description?: string | null;
  price: number;
  discount_price?: number | null;
  promo_code?: string | null;
  currency?: string;
  status?: CourseStatus;
}

export async function create(input: CourseInput, admin: User) {
  return transaction(async (db) => {
    const row = await queryOne<{ id: string }>(
      `INSERT INTO courses (title, description, price, discount_price, promo_code, currency, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [input.title, input.description ?? null, input.price, input.discount_price ?? null,
       input.promo_code?.toUpperCase() ?? null, input.currency ?? 'INR', input.status ?? 'DRAFT', admin.id],
      db,
    );
    await logAudit(admin.id, 'COURSE_CREATED', 'course', row!.id, { title: input.title }, db);
    return row!.id;
  });
}

export async function update(id: string, input: CourseInput, admin: User) {
  return transaction(async (db) => {
    const existing = await queryOne<{ id: string }>(`SELECT id FROM courses WHERE id = $1 FOR UPDATE`, [id], db);
    if (!existing) throw Errors.notFound('Course');
    await query(
      `UPDATE courses SET title = $2, description = $3, price = $4, discount_price = $5,
              promo_code = $6, currency = $7, status = $8
        WHERE id = $1`,
      [id, input.title, input.description ?? null, input.price, input.discount_price ?? null,
       input.promo_code?.toUpperCase() ?? null, input.currency ?? 'INR', input.status ?? 'DRAFT'],
      db,
    );
    await logAudit(admin.id, 'COURSE_UPDATED', 'course', id, { fields: Object.keys(input) }, db);
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
    const purchases = await queryOne<{ count: number }>(
      `SELECT count(*)::int AS count FROM purchases WHERE course_id = $1`,
      [id],
      db,
    );
    if ((purchases?.count ?? 0) > 0) {
      throw Errors.conflict('Cannot delete a course that has purchases');
    }
    // Disassociate test series from this course
    await query(`UPDATE test_series SET course_id = NULL WHERE course_id = $1`, [id], db);
    const row = await queryOne<{ id: string }>(
      `DELETE FROM courses WHERE id = $1 RETURNING id`,
      [id],
      db,
    );
    if (!row) throw Errors.notFound('Course');
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

