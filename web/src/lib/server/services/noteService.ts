import 'server-only';
import { randomUUID } from 'node:crypto';
import { query, queryOne } from '../db';
import { ApiError, Errors } from '../../errors';
import type { Note, NoteFileType, NoteMaterialType, Paginated, User } from '@/types';
import * as storage from '../storage';
import { uuidSchema } from '../../validation';
import { MAX_NOTE_BYTES, detectNoteFileType, normalizeNoteMime } from '../../notes';
export { MAX_NOTE_BYTES, detectNoteFileType, normalizeNoteMime };

function paginate<T>(items: T[], total: number, page: number, pageSize: number): Paginated<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

const NOTE_COLUMNS = `
  n.id, n.title, n.description, n.subject, n.material_type, n.exam_name, n.exam_year,
  n.course_id, n.file_name, n.file_type, n.mime_type,
  n.size_bytes, n.storage_key, n.download_count, n.is_published, n.uploaded_by, n.created_at, n.updated_at,
  c.title AS course_title,
  u.name AS uploader_name
`;

const BASE_QUERY = `
  SELECT ${NOTE_COLUMNS}
  FROM notes n
  LEFT JOIN courses c ON c.id = n.course_id
  LEFT JOIN users u ON u.id = n.uploaded_by
`;

export async function listNotes(opts: {
  page?: number;
  pageSize?: number;
  q?: string;
  subject?: string;
  materialType?: NoteMaterialType;
  examName?: string;
  examYear?: number;
  fileType?: string;
  isPublished?: boolean;
  courseId?: string;
}): Promise<Paginated<Note>> {
  const where: string[] = [];
  const params: unknown[] = [];

  if (opts.q) {
    params.push(`%${opts.q.trim()}%`);
    const n = params.length;
    where.push(
      `(n.title ILIKE $${n} OR n.description ILIKE $${n} OR n.subject ILIKE $${n} OR n.exam_name ILIKE $${n} OR n.file_name ILIKE $${n})`,
    );
  }

  if (opts.subject) {
    params.push(opts.subject.trim());
    where.push(`n.subject = $${params.length}`);
  }

  if (opts.materialType) {
    params.push(opts.materialType.toUpperCase());
    where.push(`n.material_type = $${params.length}`);
  }

  if (opts.examName) {
    params.push(opts.examName.trim());
    where.push(`n.exam_name = $${params.length}`);
  }

  if (opts.examYear) {
    params.push(opts.examYear);
    where.push(`n.exam_year = $${params.length}`);
  }

  if (opts.fileType) {
    params.push(opts.fileType.toUpperCase());
    where.push(`n.file_type = $${params.length}`);
  }

  if (opts.isPublished !== undefined) {
    params.push(opts.isPublished);
    where.push(`n.is_published = $${params.length}`);
  }

  if (opts.courseId) {
    params.push(opts.courseId);
    where.push(`n.course_id = $${params.length}`);
  }

  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const countRow = await queryOne<{ count: string }>(`SELECT COUNT(*) FROM notes n ${clause}`, params);
  const total = Number(countRow?.count || 0);

  const page = Math.max(1, opts.page || 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize || 20));
  const offset = (page - 1) * pageSize;

  params.push(pageSize, offset);
  const items = await query<Note>(
    `${BASE_QUERY} ${clause} ORDER BY n.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  return paginate(items, total, page, pageSize);
}

export async function listPublishedNotes(opts: {
  page?: number;
  pageSize?: number;
  q?: string;
  subject?: string;
  materialType?: NoteMaterialType;
  examName?: string;
  examYear?: number;
  fileType?: string;
  courseId?: string;
}): Promise<Paginated<Note>> {
  return listNotes({
    ...opts,
    isPublished: true,
  });
}

export async function getNoteById(id: string): Promise<Note | null> {
  if (!uuidSchema.safeParse(id).success) return null;
  return queryOne<Note>(`${BASE_QUERY} WHERE n.id = $1`, [id]);
}

export async function createNote(
  admin: User,
  input: {
    title: string;
    description?: string | null;
    subject?: string | null;
    materialType?: NoteMaterialType;
    examName?: string | null;
    examYear?: number | null;
    courseId?: string | null;
    filename: string;
    mime: string;
    fileType: NoteFileType;
    buffer: Buffer;
    isPublished?: boolean;
  },
): Promise<Note> {
  if (!input.title || !input.title.trim()) {
    throw Errors.badRequest('Title is required');
  }

  if (input.buffer.length > MAX_NOTE_BYTES) {
    throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'File exceeds maximum allowed size (50 MB)');
  }

  const id = randomUUID();
  const safeFilename = input.filename.replace(/[^\w.\-]+/g, '_').slice(-120) || `note_${id}.${input.fileType.toLowerCase()}`;
  const storageKey = `notes/${id}/${safeFilename}`;
  const finalMime = normalizeNoteMime(input.fileType, input.mime);

  await storage.uploadFile(storageKey, input.buffer, finalMime);

  const materialType = input.materialType === 'PYQ' ? 'PYQ' : 'NOTE';

  const row = await queryOne<{ id: string }>(
    `INSERT INTO notes (
      id, title, description, subject, material_type, exam_name, exam_year,
      course_id, file_name, file_type, mime_type,
      size_bytes, storage_key, is_published, uploaded_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING id`,
    [
      id,
      input.title.trim().slice(0, 300),
      input.description?.trim().slice(0, 2000) || null,
      input.subject?.trim().slice(0, 100) || null,
      materialType,
      input.examName?.trim().slice(0, 150) || null,
      input.examYear || null,
      input.courseId || null,
      safeFilename,
      input.fileType,
      finalMime,
      input.buffer.length,
      storageKey,
      input.isPublished !== undefined ? input.isPublished : true,
      admin.id,
    ],
  );

  if (!row) throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to create note');
  const created = await getNoteById(id);
  if (!created) throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to retrieve created note');
  return created;
}

export async function updateNote(
  id: string,
  input: {
    title?: string;
    description?: string | null;
    subject?: string | null;
    materialType?: NoteMaterialType;
    examName?: string | null;
    examYear?: number | null;
    courseId?: string | null;
    isPublished?: boolean;
  },
): Promise<Note> {
  const existing = await getNoteById(id);
  if (!existing) throw Errors.notFound('Note');

  const updates: string[] = [];
  const params: unknown[] = [id];

  if (input.title !== undefined) {
    params.push(input.title.trim().slice(0, 300));
    updates.push(`title = $${params.length}`);
  }
  if (input.description !== undefined) {
    params.push(input.description?.trim().slice(0, 2000) || null);
    updates.push(`description = $${params.length}`);
  }
  if (input.subject !== undefined) {
    params.push(input.subject?.trim().slice(0, 100) || null);
    updates.push(`subject = $${params.length}`);
  }
  if (input.materialType !== undefined) {
    params.push(input.materialType);
    updates.push(`material_type = $${params.length}`);
  }
  if (input.examName !== undefined) {
    params.push(input.examName?.trim().slice(0, 150) || null);
    updates.push(`exam_name = $${params.length}`);
  }
  if (input.examYear !== undefined) {
    params.push(input.examYear || null);
    updates.push(`exam_year = $${params.length}`);
  }
  if (input.courseId !== undefined) {
    params.push(input.courseId || null);
    updates.push(`course_id = $${params.length}`);
  }
  if (input.isPublished !== undefined) {
    params.push(input.isPublished);
    updates.push(`is_published = $${params.length}`);
  }

  if (updates.length === 0) return existing;

  await query(`UPDATE notes SET ${updates.join(', ')} WHERE id = $1`, params);
  const updated = await getNoteById(id);
  if (!updated) throw Errors.notFound('Note');
  return updated;
}

export async function deleteNote(id: string): Promise<void> {
  const existing = await getNoteById(id);
  if (!existing) throw Errors.notFound('Note');

  try {
    await storage.deleteFile(existing.storage_key);
  } catch (err) {
    console.error('Failed to remove note file from storage:', err);
  }

  await query(`DELETE FROM notes WHERE id = $1`, [id]);
}

export async function recordDownload(id: string): Promise<void> {
  await query(`UPDATE notes SET download_count = download_count + 1 WHERE id = $1`, [id]);
}

export async function listDistinctSubjects(): Promise<string[]> {
  const rows = await query<{ subject: string }>(
    `SELECT DISTINCT subject FROM notes
     WHERE subject IS NOT NULL AND TRIM(subject) <> '' AND is_published = true
     ORDER BY subject ASC`,
  );
  return rows.map((r) => r.subject);
}

export async function listDistinctExams(): Promise<string[]> {
  const rows = await query<{ exam_name: string }>(
    `SELECT DISTINCT exam_name FROM notes
     WHERE exam_name IS NOT NULL AND TRIM(exam_name) <> '' AND is_published = true
     ORDER BY exam_name ASC`,
  );
  return rows.map((r) => r.exam_name);
}

export async function getAdminNoteStats(): Promise<{
  total: number;
  downloads: number;
  pdfCount: number;
  wordCount: number;
  noteCount: number;
  pyqCount: number;
  publishedCount: number;
}> {
  const row = await queryOne<{
    total: string;
    downloads: string;
    pdf_count: string;
    word_count: string;
    note_count: string;
    pyq_count: string;
    published_count: string;
  }>(`
    SELECT
      COUNT(*)::text AS total,
      COALESCE(SUM(download_count), 0)::text AS downloads,
      COUNT(*) FILTER (WHERE file_type = 'PDF')::text AS pdf_count,
      COUNT(*) FILTER (WHERE file_type IN ('DOCX', 'DOC'))::text AS word_count,
      COUNT(*) FILTER (WHERE material_type = 'NOTE')::text AS note_count,
      COUNT(*) FILTER (WHERE material_type = 'PYQ')::text AS pyq_count,
      COUNT(*) FILTER (WHERE is_published = true)::text AS published_count
    FROM notes
  `);

  return {
    total: Number(row?.total || 0),
    downloads: Number(row?.downloads || 0),
    pdfCount: Number(row?.pdf_count || 0),
    wordCount: Number(row?.word_count || 0),
    noteCount: Number(row?.note_count || 0),
    pyqCount: Number(row?.pyq_count || 0),
    publishedCount: Number(row?.published_count || 0),
  };
}
