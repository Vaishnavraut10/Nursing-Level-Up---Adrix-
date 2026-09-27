import { route, ok, parseId, readJson } from '@/lib/server/http';
import { requireAdmin } from '@/lib/server/session';
import * as svc from '@/lib/server/services/dailyTestService';
import { dailyTestInputSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = route<{ id: string }>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  return ok(await svc.adminGet(parseId(id, 'Daily test')));
});

export const PUT = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin();
  const { id: rawId } = await params;
  const id = parseId(rawId, 'Daily test');
  await svc.update(id, await readJson(req, dailyTestInputSchema), admin);
  return ok(await svc.adminGet(id));
});

export const DELETE = route<{ id: string }>(async (_req, { params }) => {
  const admin = await requireAdmin();
  const { id: rawId } = await params;
  await svc.remove(parseId(rawId, 'Daily test'), admin);
  return ok({ deleted: true });
});
