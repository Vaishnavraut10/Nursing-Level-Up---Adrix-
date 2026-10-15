import { route, ok, parseId } from '@/lib/server/http';
import { getCurrentUser } from '@/lib/server/session';
import { getAttemptForUserAndTest } from '@/lib/server/services/attemptService';

export const dynamic = 'force-dynamic';

export const GET = route<{ id: string }>(async (_req, { params }) => {
  const user = await getCurrentUser();
  const resolvedParams = await params;
  const testSeriesId = parseId(resolvedParams.id, 'Test');

  if (!user) {
    return ok({
      authenticated: false,
      attempt: null,
      canStart: false,
      status: 'LOGIN_REQUIRED',
    });
  }

  const attempt = await getAttemptForUserAndTest(user.id, testSeriesId);

  return ok({
    authenticated: true,
    attempt,
    hasAttempt: Boolean(attempt),
    status: attempt?.status ?? 'NOT_ATTEMPTED',
  });
});
