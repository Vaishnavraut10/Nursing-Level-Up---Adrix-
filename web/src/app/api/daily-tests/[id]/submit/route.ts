import { route, ok, parseId, readJson } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import * as svc from '@/lib/server/services/dailyTestService';
import { submitSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const POST = route<{ id: string }>(async (req, { params }) => {
  const user = await requireUser();
  const { id: rawId } = await params;
  const id = parseId(rawId, 'Daily test');
  const body = await readJson(req, submitSchema);
  return ok(await svc.submit(user, id, body.attemptId, body.answers));
});
