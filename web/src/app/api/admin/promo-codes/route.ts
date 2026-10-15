import { route, ok, created, readJson, searchParams } from '@/lib/server/http';
import { requireAdmin } from '@/lib/server/session';
import * as svc from '@/lib/server/services/promoCodeService';
import { promoCodeInputSchema } from '@/lib/validation';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  course_id: z.string().uuid().optional(),
});

export const GET = route(async (req) => {
  await requireAdmin();
  const parsed = querySchema.safeParse(searchParams(req));
  const courseId = parsed.success ? parsed.data.course_id : undefined;
  return ok(await svc.adminListPromoCodes(courseId));
});

export const POST = route(async (req) => {
  const admin = await requireAdmin();
  const input = await readJson(req, promoCodeInputSchema);
  const promo = await svc.adminCreatePromoCode(input, admin);
  return created(promo);
});
