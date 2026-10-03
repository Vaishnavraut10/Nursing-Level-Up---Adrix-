import 'server-only';
import { query, queryOne, type Queryable } from '../db';
import { logAudit } from './auditService';
import type { Course, Paginated } from '@/types';

export interface FreeAccessGrantRow {
  id: string;
  user_id: string;
  student_name: string;
  student_email: string;
  student_phone: string | null;
  course_id: string;
  course_title: string;
  course_price: number;
  granted_by: string | null;
  admin_name: string | null;
  admin_email: string | null;
  granted_at: string;
  revoked_at: string | null;
  status: 'ACTIVE' | 'REVOKED';
  created_at: string;
  updated_at: string;
}

let tableEnsured = false;

/** Automatically ensures course_free_access table and indexes exist in Postgres. */
export async function ensureFreeAccessTableExists(db?: Queryable) {
  if (tableEnsured) return;
  await query(
    `CREATE TABLE IF NOT EXISTS course_free_access (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      granted_by   UUID REFERENCES users(id) ON DELETE SET NULL,
      granted_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      revoked_at   TIMESTAMPTZ,
      status       VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_course_free_access_unique_active
      ON course_free_access (user_id, course_id)
      WHERE status = 'ACTIVE';

    CREATE INDEX IF NOT EXISTS idx_course_free_access_user_id ON course_free_access (user_id);
    CREATE INDEX IF NOT EXISTS idx_course_free_access_course_id ON course_free_access (course_id);
    CREATE INDEX IF NOT EXISTS idx_course_free_access_status ON course_free_access (status);`,
    [],
    db,
  );
  tableEnsured = true;
}

/** Check if user has an unrevoked active free-access grant for a course. */
export async function hasActiveFreeAccess(userId: string, courseId: string, db?: Queryable): Promise<boolean> {
  await ensureFreeAccessTableExists(db);
  const row = await queryOne(
    `SELECT 1 FROM course_free_access
      WHERE user_id = $1 AND course_id = $2 AND status = 'ACTIVE' AND revoked_at IS NULL LIMIT 1`,
    [userId, courseId],
    db,
  );
  return row !== null;
}

/** Fetch detail for a specific grant ID. */
export async function getGrantById(grantId: string): Promise<FreeAccessGrantRow | null> {
  await ensureFreeAccessTableExists();
  return queryOne<FreeAccessGrantRow>(
    `SELECT cfa.id, cfa.user_id, u.name AS student_name, u.email AS student_email, u.phone AS student_phone,
            cfa.course_id, c.title AS course_title, c.price AS course_price,
            cfa.granted_by, a.name AS admin_name, a.email AS admin_email,
            cfa.granted_at, cfa.revoked_at, cfa.status, cfa.created_at, cfa.updated_at
       FROM course_free_access cfa
       JOIN users u ON u.id = cfa.user_id
       JOIN courses c ON c.id = cfa.course_id
       LEFT JOIN users a ON a.id = cfa.granted_by
      WHERE cfa.id = $1`,
    [grantId],
  );
}

/** Grant free course access to a student. Admin only. */
export async function grantFreeAccess(
  adminId: string,
  userId: string,
  courseId: string,
): Promise<FreeAccessGrantRow> {
  await ensureFreeAccessTableExists();

  const student = await queryOne<{ id: string; name: string; email: string }>(
    `SELECT id, name, email FROM users WHERE id = $1`,
    [userId],
  );
  if (!student) throw new Error('Student user not found');

  const course = await queryOne<{ id: string; title: string; price: number }>(
    `SELECT id, title, price FROM courses WHERE id = $1`,
    [courseId],
  );
  if (!course) throw new Error('Course not found');

  const existingActive = await queryOne<{ id: string }>(
    `SELECT id FROM course_free_access WHERE user_id = $1 AND course_id = $2 AND status = 'ACTIVE' AND revoked_at IS NULL`,
    [userId, courseId],
  );
  if (existingActive) {
    throw new Error(`Student ${student.name} already has active free access to ${course.title}.`);
  }

  const [created] = await query<FreeAccessGrantRow>(
    `INSERT INTO course_free_access (user_id, course_id, granted_by, status, granted_at)
     VALUES ($1, $2, $3, 'ACTIVE', now())
     RETURNING id`,
    [userId, courseId, adminId],
  );

  await logAudit(
    adminId,
    'COURSE_FREE_ACCESS_GRANTED' as any,
    'course_free_access',
    created.id,
    {
      student_id: userId,
      student_name: student.name,
      student_email: student.email,
      course_id: courseId,
      course_title: course.title,
      normal_price: Number(course.price),
    },
  );

  const grant = await getGrantById(created.id);
  if (!grant) throw new Error('Failed to retrieve newly created grant record.');
  return grant;
}

/** Revoke a free course access grant. Admin only. */
export async function revokeFreeAccess(
  adminId: string,
  grantId: string,
): Promise<FreeAccessGrantRow> {
  await ensureFreeAccessTableExists();

  const grant = await queryOne<{ id: string; user_id: string; course_id: string; status: string }>(
    `SELECT id, user_id, course_id, status FROM course_free_access WHERE id = $1`,
    [grantId],
  );
  if (!grant) throw new Error('Grant record not found');
  if (grant.status === 'REVOKED') throw new Error('Free access grant is already revoked');

  await query(
    `UPDATE course_free_access
        SET status = 'REVOKED', revoked_at = now(), updated_at = now()
      WHERE id = $1`,
    [grantId],
  );

  await logAudit(
    adminId,
    'COURSE_FREE_ACCESS_REVOKED' as any,
    'course_free_access',
    grantId,
    {
      grant_id: grantId,
      student_id: grant.user_id,
      course_id: grant.course_id,
      revoked_by: adminId,
    },
  );

  const updated = await getGrantById(grantId);
  if (!updated) throw new Error('Failed to retrieve updated grant record.');
  return updated;
}

/** List all free access grants for Admin view with search and pagination. */
export async function listFreeAccessGrants(opts: {
  page: number;
  pageSize: number;
  q?: string;
  status?: 'ACTIVE' | 'REVOKED';
}): Promise<Paginated<FreeAccessGrantRow>> {
  await ensureFreeAccessTableExists();
  const where: string[] = [];
  const params: unknown[] = [];

  if (opts.q && opts.q.trim()) {
    params.push(`%${opts.q.trim()}%`);
    where.push(
      `(u.name ILIKE $${params.length} OR u.email::text ILIKE $${params.length} OR u.phone ILIKE $${params.length} OR u.id::text ILIKE $${params.length} OR c.title ILIKE $${params.length} OR c.id::text ILIKE $${params.length})`,
    );
  }

  if (opts.status) {
    params.push(opts.status);
    where.push(`cfa.status = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [{ total }] = await query<{ total: number }>(
    `SELECT COUNT(*)::int AS total
       FROM course_free_access cfa
       JOIN users u ON u.id = cfa.user_id
       JOIN courses c ON c.id = cfa.course_id
       ${whereSql}`,
    params,
  );

  params.push(opts.pageSize, (opts.page - 1) * opts.pageSize);

  const items = await query<FreeAccessGrantRow>(
    `SELECT cfa.id, cfa.user_id, u.name AS student_name, u.email AS student_email, u.phone AS student_phone,
            cfa.course_id, c.title AS course_title, c.price AS course_price,
            cfa.granted_by, a.name AS admin_name, a.email AS admin_email,
            cfa.granted_at, cfa.revoked_at, cfa.status, cfa.created_at, cfa.updated_at
       FROM course_free_access cfa
       JOIN users u ON u.id = cfa.user_id
       JOIN courses c ON c.id = cfa.course_id
       LEFT JOIN users a ON a.id = cfa.granted_by
       ${whereSql}
      ORDER BY cfa.granted_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  return {
    items,
    total,
    page: opts.page,
    pageSize: opts.pageSize,
    totalPages: Math.max(1, Math.ceil(total / opts.pageSize)),
  };
}

/** Search students by name, email, phone, or user ID for Admin Free Access tool. */
export async function searchStudents(q: string) {
  if (!q || !q.trim()) return [];
  const term = `%${q.trim()}%`;
  return query<{ id: string; name: string; email: string; phone: string | null }>(
    `SELECT id, name, email, phone FROM users
      WHERE role = 'STUDENT' AND (name ILIKE $1 OR email::text ILIKE $1 OR phone ILIKE $1 OR id::text ILIKE $1)
      ORDER BY name ASC LIMIT 20`,
    [term],
  );
}

/** Search courses by title or course ID. */
export async function searchCourses(q?: string) {
  const where: string[] = [];
  const params: unknown[] = [];
  if (q && q.trim()) {
    params.push(`%${q.trim()}%`);
    where.push(`(title ILIKE $${params.length} OR id::text ILIKE $${params.length})`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return query<Course>(
    `SELECT id, title, description, price, is_free, status, created_at, updated_at
       FROM courses ${whereSql} ORDER BY updated_at DESC LIMIT 50`,
    params,
  );
}

export { listFreeAccessGrants as listGrants };
