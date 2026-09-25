import { route, ok, readJson, parseId } from '@/lib/server/http';
import { getCurrentUser } from '@/lib/server/session';
import { validatePromoCode } from '@/lib/server/services/courseService';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const schema = z.object({
  courseId: z.string().uuid(),
  promoCode: z.string().trim().min(1).max(50),
});

export const POST = route(async (req) => {
  await getCurrentUser(); // Ensure request is authenticated or valid
  const body = await readJson(req, schema);
  const courseId = parseId(body.courseId, 'Course');

  const discountPrice = await validatePromoCode(courseId, body.promoCode);

  if (discountPrice !== null) {
    return ok({
      valid: true,
      discountPrice,
      promoCode: body.promoCode.trim().toUpperCase(),
    });
  }

  return ok({
    valid: false,
    message: 'Invalid promo code. Please check and try again.',
  });
});
