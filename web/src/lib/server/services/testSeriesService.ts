import 'server-only';
import { query, queryOne, transaction } from '../db';
import { ApiError, Errors } from '../../errors';
import type { AccessState, Paginated, PublicTestSeries, SeriesReleaseState, TestSeries, TestStatus, User } from '@/types';
import type { TestSeriesInput } from '../../validation';
import { logAudit } from './auditService';
import * as courseService from './courseService';

// question_count is derived from APPROVED questions at query time, never stored (Database doc §3).
const QUESTION_COUNT = `(SELECT COUNT(*) FROM questions q WHERE q.test_series_id = ts.id AND q.review_status = 'APPROVED')::int`;

const PUBLIC_COLUMNS = `ts.id, ts.title, ts.description, ts.price, ts.currency, ts.is_free, ts.duration_minutes,
  ts.instructions, ts.published_at, ts.course_id, ts.release_after_days, ${QUESTION_COUNT} AS question_count,
  COALESCE(
    (SELECT c.thumbnail_key FROM courses c WHERE c.id = ts.course_id),
    (SELECT c2.thumbnail_key FROM courses c2 WHERE c2.status = 'PUBLISHED' ORDER BY c2.created_at LIMIT 1)
  ) AS thumbnail_key,
  COALESCE(
    (SELECT c3.id FROM courses c3 WHERE c3.id = ts.course_id),
    (SELECT c4.id FROM courses c4 WHERE c4.status = 'PUBLISHED' ORDER BY c4.created_at LIMIT 1)
  ) AS resolved_course_id,
  COALESCE(
    (SELECT c5.title FROM courses c5 WHERE c5.id = ts.course_id),
    (SELECT c6.title FROM courses c6 WHERE c6.status = 'PUBLISHED' ORDER BY c6.created_at LIMIT 1)
  ) AS course_title,
  COALESCE(
    (SELECT c7.description FROM courses c7 WHERE c7.id = ts.course_id),
    (SELECT c8.description FROM courses c8 WHERE c8.status = 'PUBLISHED' ORDER BY c8.created_at LIMIT 1)
  ) AS course_description,
  COALESCE(
    (SELECT c9.is_free FROM courses c9 WHERE c9.id = ts.course_id),
    (SELECT c10.is_free FROM courses c10 WHERE c10.status = 'PUBLISHED' ORDER BY c10.created_at LIMIT 1)
  ) AS course_is_free,
  COALESCE(
    (SELECT c11.price FROM courses c11 WHERE c11.id = ts.course_id),
    (SELECT c12.price FROM courses c12 WHERE c12.status = 'PUBLISHED' ORDER BY c12.created_at LIMIT 1)
  ) AS course_price,
  COALESCE(
    (SELECT c13.discount_price FROM courses c13 WHERE c13.id = ts.course_id),
    (SELECT c14.discount_price FROM courses c14 WHERE c14.status = 'PUBLISHED' ORDER BY c14.created_at LIMIT 1)
  ) AS course_discount_price`;

const ADMIN_COLUMNS = `ts.id, ts.title, ts.description, ts.price, ts.currency, ts.is_free, ts.duration_minutes,
  ts.status, ts.instructions, ts.course_id, ts.release_after_days, ts.created_at, ts.updated_at, ts.published_at, ${QUESTION_COUNT} AS question_count`;

/**
 * IST release time: 5:00 PM IST = 11:30 UTC.
 * Given access_started_at and release_after_days, compute when a series unlocks.
 */
function computeReleaseDate(accessStartedAt: Date, releaseAfterDays: number): Date {
  if (releaseAfterDays === 0) return accessStartedAt; // immediate
  const release = new Date(accessStartedAt);
  release.setUTCDate(release.getUTCDate() + releaseAfterDays);
  // Set to 5:00 PM IST = 11:30 UTC
  release.setUTCHours(11, 30, 0, 0);
  return release;
}

function computeReleaseState(
  releaseAfterDays: number,
  accessStartedAt: Date | null,
  now: Date,
): { state: SeriesReleaseState; releasesAt: string | null } {
  if (!accessStartedAt) return { state: 'LOCKED', releasesAt: null };
  if (releaseAfterDays === 0) return { state: 'AVAILABLE', releasesAt: null };
  const releaseDate = computeReleaseDate(accessStartedAt, releaseAfterDays);
  if (now >= releaseDate) return { state: 'AVAILABLE', releasesAt: null };
  return { state: 'UPCOMING', releasesAt: releaseDate.toISOString() };
}

/** Access state now derives from course ownership, not per-series purchase. */
export function accessState(isFree: boolean, viewer: User | null, hasCourseAccess: boolean): AccessState {
  if (isFree) return 'FREE';
  if (!viewer) return 'LOGIN_REQUIRED';
  if (viewer.role === 'ADMIN' || hasCourseAccess) return 'PURCHASED';
  return 'PURCHASE_REQUIRED';
}

type PublicRow = Omit<PublicTestSeries, 'access' | 'has_access' | 'release_state' | 'releases_at'> & {
  course_id: string | null;
  thumbnail_key?: string | null;
  resolved_course_id?: string | null;
  course_title?: string | null;
  course_description?: string | null;
  course_is_free?: boolean;
  course_price?: number;
  course_discount_price?: number | null;
};

function toPublic(
  row: PublicRow,
  viewer: User | null,
  hasCourseAccess: boolean,
  accessStartedAt: Date | null,
): PublicTestSeries {
  const isFree = row.course_id
    ? Boolean(row.course_is_free || (row.course_price !== undefined && Number(row.course_price) === 0))
    : row.is_free;

  const access = accessState(isFree, viewer, hasCourseAccess);
  const now = new Date();
  const isAdmin = viewer?.role === 'ADMIN';
  const { state: releaseState, releasesAt } = isAdmin
    ? { state: 'AVAILABLE' as SeriesReleaseState, releasesAt: null }
    : computeReleaseState(row.release_after_days, accessStartedAt, now);

  const hasAccess = Boolean(viewer) && (
    isFree ||
    (access === 'PURCHASED' && releaseState === 'AVAILABLE')
  );

  const courseId = row.course_id || row.resolved_course_id;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    currency: row.currency,
    is_free: isFree,
    duration_minutes: row.duration_minutes,
    instructions: row.instructions,
    published_at: row.published_at,
    question_count: row.question_count,
    access,
    has_access: hasAccess,
    course_id: row.course_id,
    resolved_course_id: courseId,
    course_title: row.course_title || 'Nursing Exam',
    course_description: row.course_description || 'Nursing Officer Practice Course',
    course_is_free: row.course_is_free ?? row.is_free,
    course_price: row.course_price ?? row.price,
    course_discount_price: row.course_discount_price ?? null,
    thumbnail_url: row.thumbnail_key && courseId ? `/api/courses/${courseId}/thumbnail?v=${row.thumbnail_key}` : null,
    release_after_days: row.release_after_days,
    release_state: releaseState,
    releases_at: releasesAt,
  };
}

export async function listPublished(viewer: User | null): Promise<PublicTestSeries[]> {
  const rows = await query<PublicRow>(
    `SELECT ${PUBLIC_COLUMNS}
       FROM test_series ts
      WHERE ts.status = 'PUBLISHED'
        AND (ts.course_id IS NULL OR EXISTS (
          SELECT 1 FROM courses c WHERE c.id = ts.course_id AND c.status = 'PUBLISHED'
        ))
      ORDER BY ts.release_after_days ASC, ts.title`,
  );

  const defaultCourse = await courseService.getPublishedCourse();
  const result: PublicTestSeries[] = [];

  for (const r of rows) {
    const courseId = r.course_id || r.resolved_course_id || defaultCourse?.id;
    let hasCourseAccess = false;
    let accessStartedAt: Date | null = null;
    if (courseId && viewer) {
      hasCourseAccess = await courseService.hasCoursePurchase(viewer.id, courseId);
      if (hasCourseAccess) {
        accessStartedAt = await courseService.getAccessStartedAt(viewer.id, courseId);
      }
    }
    result.push(toPublic(r, viewer, hasCourseAccess, accessStartedAt));
  }
  return result;
}

export async function listPublishedForCourse(courseId: string, viewer: User | null): Promise<PublicTestSeries[]> {
  const course = await courseService.getById(courseId);
  if (!course || course.status !== 'PUBLISHED') return [];

  let hasCourseAccess = false;
  let accessStartedAt: Date | null = null;

  if (viewer) {
    hasCourseAccess = await courseService.hasCoursePurchase(viewer.id, courseId);
    if (hasCourseAccess) {
      accessStartedAt = await courseService.getAccessStartedAt(viewer.id, courseId);
    }
  }

  const rows = await query<PublicRow>(
    `SELECT ${PUBLIC_COLUMNS}
       FROM test_series ts
      WHERE ts.status = 'PUBLISHED' AND (ts.course_id = $1 OR ts.course_id IS NULL)
      ORDER BY ts.release_after_days ASC, ts.created_at ASC`,
    [courseId],
  );
  return rows.map((r) => toPublic(r, viewer, hasCourseAccess, accessStartedAt));
}

export async function getPublished(id: string, viewer: User | null): Promise<PublicTestSeries | null> {
  const row = await queryOne<PublicRow>(
    `SELECT ${PUBLIC_COLUMNS}
       FROM test_series ts
      WHERE ts.id = $1 AND ts.status = 'PUBLISHED'
        AND (ts.course_id IS NULL OR EXISTS (
          SELECT 1 FROM courses c WHERE c.id = ts.course_id AND c.status = 'PUBLISHED'
        ))`,
    [id],
  );
  if (!row) return null;

  let hasCourseAccess = false;
  let accessStartedAt: Date | null = null;

  if (row.course_id && viewer) {
    hasCourseAccess = await courseService.hasCoursePurchase(viewer.id, row.course_id);
    if (hasCourseAccess) {
      accessStartedAt = await courseService.getAccessStartedAt(viewer.id, row.course_id);
    }
  }

  return toPublic(row, viewer, hasCourseAccess, accessStartedAt);
}

/** Check if a user has access to a specific test series (considering drip schedule). */
export async function hasAccess(userId: string, testSeriesId: string, userRole?: string): Promise<boolean> {
  if (userRole === 'ADMIN') return true;

  const series = await queryOne<{ is_free: boolean; course_id: string | null; status: string; release_after_days: number; course_status: string | null; course_is_free: boolean | null; course_price: number | null }>(
    `SELECT ts.is_free, ts.course_id, ts.status, ts.release_after_days, c.status AS course_status, c.is_free AS course_is_free, c.price AS course_price
       FROM test_series ts
       LEFT JOIN courses c ON c.id = ts.course_id
      WHERE ts.id = $1`,
    [testSeriesId],
  );
  if (!series) return false;
  if (series.status !== 'PUBLISHED') return false;
  if (series.course_id && series.course_status !== 'PUBLISHED') return false;

  const isFree = series.course_id ? Boolean(series.course_is_free || Number(series.course_price) === 0) : series.is_free;
  if (isFree) return true;
  if (!series.course_id) return false;

  const hasPurchase = await courseService.hasCoursePurchase(userId, series.course_id);
  if (!hasPurchase) return false;

  // Check drip schedule
  if (series.release_after_days === 0) return true;
  const accessStartedAt = await courseService.getAccessStartedAt(userId, series.course_id);
  if (!accessStartedAt) return false;
  const releaseDate = computeReleaseDate(accessStartedAt, series.release_after_days);
  return new Date() >= releaseDate;
}

/** Legacy alias pointing to course-based hasAccess */
export const hasPurchased = hasAccess;

// ------------------------------------------------------------------ admin

export async function adminList(opts: {
  page: number;
  pageSize: number;
  q?: string;
  status?: TestStatus;
}): Promise<Paginated<TestSeries & { attempt_count: number; purchase_count: number }>> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.q) {
    params.push(`%${opts.q}%`);
    where.push(`ts.title ILIKE $${params.length}`);
  }
  if (opts.status) {
    params.push(opts.status);
    where.push(`ts.status = $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [{ total }] = await query<{ total: number }>(`SELECT COUNT(*)::int AS total FROM test_series ts ${whereSql}`, params);
  params.push(opts.pageSize, (opts.page - 1) * opts.pageSize);
  const items = await query<TestSeries & { attempt_count: number; purchase_count: number }>(
    `SELECT ${ADMIN_COLUMNS},
            (SELECT COUNT(*) FROM attempts a WHERE a.test_series_id = ts.id)::int AS attempt_count,
            0::int AS purchase_count
       FROM test_series ts ${whereSql}
      ORDER BY ts.release_after_days ASC, ts.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return { items, page: opts.page, pageSize: opts.pageSize, total, totalPages: Math.max(1, Math.ceil(total / opts.pageSize)) };
}

export async function adminGet(id: string) {
  const row = await queryOne<TestSeries & { pending_count: number; attempt_count: number; purchase_count: number; revenue: number }>(
    `SELECT ${ADMIN_COLUMNS},
            (SELECT COUNT(*) FROM questions q WHERE q.test_series_id = ts.id AND q.review_status = 'PENDING_REVIEW')::int AS pending_count,
            (SELECT COUNT(*) FROM attempts a WHERE a.test_series_id = ts.id)::int AS attempt_count,
            0::int AS purchase_count,
            0::float AS revenue
       FROM test_series ts WHERE ts.id = $1`,
    [id],
  );
  if (!row) throw Errors.notFound('Test series');
  return row;
}

async function assertPublishable(id: string, db?: Parameters<typeof query>[2]) {
  const [{ count }] = await query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM questions WHERE test_series_id = $1 AND review_status = 'APPROVED'`,
    [id],
    db,
  );
  if (count === 0) throw new ApiError(409, 'CONFLICT', 'Add at least one approved question before publishing');
}

export async function create(input: TestSeriesInput, admin: User) {
  return transaction(async (db) => {
    if (input.status === 'PUBLISHED') {
      throw new ApiError(409, 'CONFLICT', 'Create the test as a draft, add questions, then publish it');
    }
    const row = await queryOne<{ id: string }>(
      `INSERT INTO test_series (title, description, price, currency, is_free, duration_minutes, status, instructions, created_by, course_id, release_after_days)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [input.title, input.description, input.price, input.currency, input.is_free, input.duration_minutes,
        input.status, input.instructions, admin.id, input.course_id ?? null, input.release_after_days ?? 0],
      db,
    );
    await logAudit(admin.id, 'TEST_CREATED', 'test_series', row!.id, { title: input.title }, db);
    return row!.id;
  });
}

export async function update(id: string, input: TestSeriesInput, admin: User) {
  return transaction(async (db) => {
    const existing = await queryOne<{ status: TestStatus }>(`SELECT status FROM test_series WHERE id = $1 FOR UPDATE`, [id], db);
    if (!existing) throw Errors.notFound('Test series');
    if (input.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') await assertPublishable(id, db);
    await query(
      `UPDATE test_series
          SET title = $2, description = $3, price = $4, currency = $5, is_free = $6, duration_minutes = $7,
              status = $8, instructions = $9, course_id = $10, release_after_days = $11,
              published_at = CASE WHEN $8::test_status = 'PUBLISHED' AND published_at IS NULL THEN now() ELSE published_at END
        WHERE id = $1`,
      [id, input.title, input.description, input.price, input.currency, input.is_free, input.duration_minutes,
        input.status, input.instructions, input.course_id ?? null, input.release_after_days ?? 0],
      db,
    );
    await logAudit(admin.id, 'TEST_UPDATED', 'test_series', id, { fields: Object.keys(input) }, db);
    if (input.status !== existing.status) {
      const action = input.status === 'PUBLISHED' ? 'TEST_PUBLISHED' : input.status === 'ARCHIVED' ? 'TEST_ARCHIVED' : 'TEST_UNPUBLISHED';
      await logAudit(admin.id, action, 'test_series', id, { from: existing.status }, db);
    }
  });
}

export async function setStatus(id: string, status: TestStatus, admin: User) {
  return transaction(async (db) => {
    const existing = await queryOne<{ status: TestStatus }>(`SELECT status FROM test_series WHERE id = $1 FOR UPDATE`, [id], db);
    if (!existing) throw Errors.notFound('Test series');
    if (status === 'PUBLISHED') await assertPublishable(id, db);
    await query(
      `UPDATE test_series SET status = $2,
              published_at = CASE WHEN $2::test_status = 'PUBLISHED' THEN COALESCE(published_at, now()) ELSE published_at END
        WHERE id = $1`,
      [id, status],
      db,
    );
    const action = status === 'PUBLISHED' ? 'TEST_PUBLISHED' : status === 'ARCHIVED' ? 'TEST_ARCHIVED' : 'TEST_UNPUBLISHED';
    await logAudit(admin.id, action, 'test_series', id, { from: existing.status }, db);
  });
}

/** Hard delete is only allowed for series with no attempt history; otherwise archive it. */
export async function remove(id: string, admin: User) {
  return transaction(async (db) => {
    const row = await queryOne<{ title: string; history: number }>(
      `SELECT title,
              ((SELECT COUNT(*) FROM attempts WHERE test_series_id = $1))::int AS history
         FROM test_series WHERE id = $1 FOR UPDATE`,
      [id],
      db,
    );
    if (!row) throw Errors.notFound('Test series');
    if (row.history > 0) {
      throw Errors.conflict('This test series has attempts. Archive it instead to keep that history.');
    }
    await query(`DELETE FROM test_series WHERE id = $1`, [id], db);
    await logAudit(admin.id, 'TEST_DELETED', 'test_series', id, { title: row.title }, db);
  });
}
