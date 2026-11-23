import { route, ok, readJson, parseId } from '@/lib/server/http';
import { requireAdmin } from '@/lib/server/session';
import * as noteService from '@/lib/server/services/noteService';
import { Errors } from '@/lib/errors';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateNoteSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(300).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  subject: z.string().trim().max(100).nullable().optional(),
  courseId: z.string().uuid().nullable().optional(),
  isPublished: z.boolean().optional(),
});

export const GET = route(async (_req, { params }) => {
  await requireAdmin();
  const id = parseId(params.id, 'Note');
  const note = await noteService.getNoteById(id);
  if (!note) throw Errors.notFound('Note');
  return ok(note);
});

export const PATCH = route(async (req, { params }) => {
  await requireAdmin();
  const id = parseId(params.id, 'Note');
  const data = await readJson(req, updateNoteSchema);
  const updated = await noteService.updateNote(id, data);
  return ok(updated);
});

export const DELETE = route(async (_req, { params }) => {
  await requireAdmin();
  const id = parseId(params.id, 'Note');
  await noteService.deleteNote(id);
  return ok({ success: true, message: 'Note deleted successfully' });
});
