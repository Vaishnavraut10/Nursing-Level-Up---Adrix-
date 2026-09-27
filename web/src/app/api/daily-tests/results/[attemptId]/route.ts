import { route, ok, parseId } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import * as svc from '@/lib/server/services/dailyTestService';

export const dynamic = 'force-dynamic';

export const GET = route<{ attemptId: string }>(async (_req, { params }) => {
  const user = await requireUser();
  const { attemptId: rawId } = await params;
  const attemptId = parseId(rawId, 'Attempt');
  return ok(await svc.getResult(user, attemptId));
});
