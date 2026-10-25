import { z } from 'zod';
import { route, ok, readJson } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import { syncOrderWithGateway } from '@/lib/server/services/purchaseService';
import { rateLimit } from '@/lib/server/rateLimit';

const schema = z.object({
  orderId: z.string().min(1).max(100),
});

/**
 * Synchronizes an order with Razorpay API directly.
 * Useful when modal dismisses or UPI callback is delayed/interrupted.
 */
export const POST = route(async (req) => {
  const user = await requireUser();
  rateLimit('sync:' + user.id, 20, 60_000);
  const { orderId } = await readJson(req, schema);
  const purchase = await syncOrderWithGateway(orderId, user.id);
  return ok({
    status: purchase?.status ?? 'UNKNOWN',
    purchaseId: purchase?.id,
    courseId: purchase?.course_id,
    paymentId: purchase?.payment_id,
  });
});
