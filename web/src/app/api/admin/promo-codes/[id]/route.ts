import { route, ok, parseId, readJson } from '@/lib/server/http';
import { requireAdmin } from '@/lib/server/session';
import * as svc from '@/lib/server/services/promoCodeService';
import { promoCodeInputSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = route<{ id: string }>(async (_req, { params }) => {
  await requireAdmin();
  const resolvedParams = await params;
  return ok(await svc.adminGetPromoCode(parseId(resolvedParams.id, 'Promo Code')));
});

export const PUT = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin();
  const resolvedParams = await params;
  const id = parseId(resolvedParams.id, 'Promo Code');
  const input = await readJson(req, promoCodeInputSchema.partial());
  const updated = await svc.adminUpdatePromoCode(id, input, admin);
  return ok(updated);
});

export const PATCH = route<{ id: string }>(async (_req, { params }) => {
  const admin = await requireAdmin();
  const resolvedParams = await params;
  const id = parseId(resolvedParams.id, 'Promo Code');
  const toggled = await svc.adminTogglePromoCode(id, admin);
  return ok(toggled);
});

export const DELETE = route<{ id: string }>(async (_req, { params }) => {
  const admin = await requireAdmin();
  const resolvedParams = await params;
  const id = parseId(resolvedParams.id, 'Promo Code');
  await svc.adminDeletePromoCode(id, admin);
  return ok({ deleted: true });
});
