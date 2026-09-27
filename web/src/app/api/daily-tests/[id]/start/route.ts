import { route, created, parseId } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import * as svc from '@/lib/server/services/dailyTestService';

export const dynamic = 'force-dynamic';

export const POST = route<{ id: string }>(async (_req, { params }) => {
  const user = await requireUser();
  const { id: rawId } = await params;
  const id = parseId(rawId, 'Daily test');
  return created(await svc.start(user, id));
});
