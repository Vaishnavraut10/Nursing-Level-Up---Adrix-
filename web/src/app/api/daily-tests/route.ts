import { route, ok } from '@/lib/server/http';
import { getCurrentUser } from '@/lib/server/session';
import * as svc from '@/lib/server/services/dailyTestService';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const user = await getCurrentUser();
  return ok(await svc.listPublished(user));
});
