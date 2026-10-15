import { route, ok, readJson, parseId } from '@/lib/server/http';
import { getCurrentUser } from '@/lib/server/session';
import { validatePromoCodeDetails } from '@/lib/server/services/promoCodeService';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const schema = z.object({
  courseId: z.string().uuid(),
  promoCode: z.string().trim().min(1).max(50),
});

export const POST = route(async (req) => {
  const user = await getCurrentUser();
  const body = await readJson(req, schema);
  const courseId = parseId(body.courseId, 'Course');

  const result = await validatePromoCodeDetails(courseId, body.promoCode, user?.id);

  if (result.valid) {
    return ok({
      valid: true,
      discountPrice: result.discountedPrice,
      originalPrice: result.originalPrice,
      discountAmount: result.discountAmount,
      discountType: result.discountType,
      discountValue: result.discountValue,
      promoCode: result.code,
    });
  }

  return ok({
    valid: false,
    message: result.message,
  });
});
