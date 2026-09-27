import { route, ok, parseId } from '@/lib/server/http';
import { getCurrentUser } from '@/lib/server/session';
import * as svc from '@/lib/server/services/dailyTestService';
import { Errors } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export const GET = route<{ id: string }>(async (_req, { params }) => {
  const user = await getCurrentUser();
  const { id: rawId } = await params;
  const id = parseId(rawId, 'Daily test');
  const test = await svc.getPublished(id, user);
  if (!test) throw Errors.notFound('Daily test');
  return ok(test);
});
