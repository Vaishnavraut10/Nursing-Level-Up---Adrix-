import { z } from 'zod';
import { route, ok, readJson } from '@/lib/server/http';
import { requireAdmin } from '@/lib/server/session';
import { reconcilePurchases } from '@/lib/server/services/adminService';

export const dynamic = 'force-dynamic';

const schema = z.object({
  dryRun: z.boolean().default(true),
});

/**
 * Admin-only reconciliation endpoint.
 * Audits all purchases against verified payment events and repairs missing entitlements.
 */
export const POST = route(async (req) => {
  const admin = await requireAdmin();
  const body = await readJson(req, schema).catch(() => ({ dryRun: true }));
  const result = await reconcilePurchases(admin.id, body.dryRun);
  return ok(result);
});
