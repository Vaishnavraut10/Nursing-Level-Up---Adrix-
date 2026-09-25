import { route, ok, parseId } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import { enrollFreeCourse } from '@/lib/server/services/purchaseService';

export const POST = route<{ id: string }>(async (_req, { params }) => {
  const user = await requireUser();
  const id = parseId(params.id, 'Course');
  const purchase = await enrollFreeCourse(user, id);
  return ok({ purchase, success: true });
});
