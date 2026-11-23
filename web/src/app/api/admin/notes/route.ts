import { route, ok, created } from '@/lib/server/http';
import { requireAdmin } from '@/lib/server/session';
import * as noteService from '@/lib/server/services/noteService';
import { ApiError, Errors } from '@/lib/errors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = route(async (req) => {
  await requireAdmin();
  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') || '1');
  const pageSize = Number(url.searchParams.get('pageSize') || '20');
  const q = url.searchParams.get('q') || undefined;
  const subject = url.searchParams.get('subject') || undefined;
  const fileType = url.searchParams.get('fileType') || undefined;
  const courseId = url.searchParams.get('courseId') || undefined;
  const status = url.searchParams.get('status');

  let isPublished: boolean | undefined = undefined;
  if (status === 'published') isPublished = true;
  if (status === 'draft') isPublished = false;

  const [notes, stats] = await Promise.all([
    noteService.listNotes({ page, pageSize, q, subject, fileType, courseId, isPublished }),
    noteService.getAdminNoteStats(),
  ]);

  return ok({ ...notes, stats });
});

export const POST = route(async (req) => {
  const admin = await requireAdmin();

  const form = await req.formData().catch(() => {
    throw Errors.badRequest('Expected multipart/form-data');
  });

  const file = form.get('file');
  const title = String(form.get('title') || '').trim();
  const description = form.get('description') ? String(form.get('description')).trim() : null;
  const subject = form.get('subject') ? String(form.get('subject')).trim() : null;
  const courseId = form.get('courseId') ? String(form.get('courseId')).trim() : null;
  const isPublishedStr = form.get('isPublished');
  const isPublished = isPublishedStr === 'false' ? false : true;

  if (!title) {
    throw Errors.badRequest('Title is required');
  }

  if (!(file instanceof File) || file.size === 0) {
    throw Errors.badRequest('Please select a file to upload');
  }

  if (file.size > noteService.MAX_NOTE_BYTES) {
    throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Files must be 50 MB or smaller');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileType = noteService.detectNoteFileType(file.name, file.type, buffer);

  if (!fileType) {
    throw new ApiError(
      415,
      'UNSUPPORTED_MEDIA_TYPE',
      'Only PDF (.pdf) and Word documents (.docx, .doc) are supported for notes',
    );
  }

  const createdNote = await noteService.createNote(admin, {
    title,
    description,
    subject,
    courseId,
    filename: file.name,
    mime: file.type,
    fileType,
    buffer,
    isPublished,
  });

  return created(createdNote);
});

