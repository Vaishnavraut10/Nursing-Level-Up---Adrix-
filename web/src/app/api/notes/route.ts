import { route, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import * as noteService from '@/lib/server/services/noteService';

export const dynamic = 'force-dynamic';

export const GET = route(async (req) => {
  await requireUser();
  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') || '1');
  const pageSize = Number(url.searchParams.get('pageSize') || '20');
  const q = url.searchParams.get('q') || undefined;
  const subject = url.searchParams.get('subject') || undefined;
  const fileType = url.searchParams.get('fileType') || undefined;
  const courseId = url.searchParams.get('courseId') || undefined;

  const [notes, subjects] = await Promise.all([
    noteService.listPublishedNotes({ page, pageSize, q, subject, fileType, courseId }),
    noteService.listDistinctSubjects(),
  ]);

  return ok({ ...notes, subjects });
});
