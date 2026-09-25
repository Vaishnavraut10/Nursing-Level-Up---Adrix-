import 'server-only';
import { query, queryOne, transaction } from '../db';
import { Errors } from '../../errors';
import type { Course, CourseStatus, Paginated, User } from '@/types';
import { logAudit } from './auditService';

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
  const row = await queryOne<Course>(`SELECT ${PUBLIC_COURSE_COLUMNS} FROM courses c WHERE c.id = $1`, [id]);
  return row ? withThumbnailUrl(row) : null;
}

// ---- Access checks ----

/** Returns true if the user has a successful course purchase or if the course is free. */
export async function hasCoursePurchase(userId: string, courseId: string): Promise<boolean> {
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
  return row !== null;
}

/** Returns the earliest successful course purchase date (access_started_at for drip schedule). */
export async function getAccessStartedAt(userId: string, courseId: string): Promise<Date | null> {
  const row = await queryOne<{ access_started_at: string }>(
    `SELECT MIN(created_at) AS access_started_at FROM purchases
     WHERE user_id = $1 AND course_id = $2 AND status = 'SUCCESS'`,
    [userId, courseId],
  );
  if (row?.access_started_at) {
    return new Date(row.access_started_at);
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
export async function validatePromoCode(courseOrId: Course | string, code: string): Promise<number | null> {
  const courseId = typeof courseOrId === 'string' ? courseOrId : courseOrId.id;
  const row = await queryOne<{ promo_code: string | null; discount_price: number | null; is_free: boolean }>(
    `SELECT promo_code, discount_price, is_free FROM courses WHERE id = $1`,
    [courseId],
  );
  if (!row || row.is_free || !row.promo_code || row.discount_price === null) return null;
  if (code.trim().toUpperCase() !== row.promo_code.trim().toUpperCase()) return null;
  return Number(row.discount_price);
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
  const rows = await query<Course & { test_series_count: number; purchase_count: number; revenue: number }>(
    `SELECT ${COURSE_COLUMNS},
            (SELECT COUNT(*) FROM test_series ts WHERE ts.course_id = c.id)::int AS test_series_count,
            (SELECT COUNT(*) FROM purchases p WHERE p.course_id = c.id AND p.status = 'SUCCESS')::int AS purchase_count,
            (SELECT COALESCE(SUM(p.amount), 0) FROM purchases p WHERE p.course_id = c.id AND p.status = 'SUCCESS') AS revenue
       FROM courses c ${whereSql}
      ORDER BY c.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  const items = rows.map(withThumbnailUrl);
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
  return withThumbnailUrl(row);
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
}

export async function create(input: CourseInput, admin: User) {
  const isFree = input.is_free ?? (input.price === 0);
  const price = isFree ? 0 : input.price;
  const discountPrice = isFree ? null : (input.discount_price ?? null);
  const promoCode = isFree ? null : (input.promo_code?.toUpperCase() ?? null);

  return transaction(async (db) => {
    const row = await queryOne<{ id: string }>(
      `INSERT INTO courses (title, description, price, discount_price, promo_code, currency, status, is_free, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [input.title, input.description ?? null, price, discountPrice,
       promoCode, input.currency ?? 'INR', input.status ?? 'DRAFT', isFree, admin.id],
      db,
    );
    await logAudit(admin.id, 'COURSE_CREATED', 'course', row!.id, { title: input.title }, db);
    return row!.id;
  });
}

export async function update(id: string, input: CourseInput, admin: User) {
  const isFree = input.is_free ?? (input.price === 0);
  const price = isFree ? 0 : input.price;
  const discountPrice = isFree ? null : (input.discount_price ?? null);
  const promoCode = isFree ? null : (input.promo_code?.toUpperCase() ?? null);

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

