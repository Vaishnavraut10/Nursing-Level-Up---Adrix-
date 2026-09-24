import { route, ok, created, readJson, searchParams } from '@/lib/server/http';
import { requireAdmin } from '@/lib/server/session';
import * as svc from '@/lib/server/services/courseService';
import { paginationSchema, courseInputSchema, courseStatusSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const filters = paginationSchema.extend({ status: courseStatusSchema.optional() });

export const GET = route(async (req) => {
  await requireAdmin();
  return ok(await svc.adminList(filters.parse(searchParams(req))));
});

export const POST = route(async (req) => {
  const admin = await requireAdmin();
  const id = await svc.create(await readJson(req, courseInputSchema), admin);
  return created(await svc.adminGet(id));
});
