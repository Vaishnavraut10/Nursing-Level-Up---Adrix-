import { route, ok, parseId, readJson } from '@/lib/server/http';
import { requireAdmin } from '@/lib/server/session';
import * as svc from '@/lib/server/services/courseService';
import { courseInputSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = route<{ id: string }>(async (_req, { params }) => {
  await requireAdmin();
  return ok(await svc.adminGet(parseId(params.id, 'Course')));
});

export const PUT = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin();
  const id = parseId(params.id, 'Course');
  await svc.update(id, await readJson(req, courseInputSchema), admin);
  return ok(await svc.adminGet(id));
});

export const DELETE = route<{ id: string }>(async (_req, { params }) => {
  const admin = await requireAdmin();
  await svc.remove(parseId(params.id, 'Course'), admin);
  return ok({ deleted: true });
});
