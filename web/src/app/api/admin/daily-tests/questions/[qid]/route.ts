import { route, ok, parseId, readJson } from '@/lib/server/http';
import { requireAdmin } from '@/lib/server/session';
import * as svc from '@/lib/server/services/dailyTestService';
import { dailyQuestionInputSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const PUT = route<{ qid: string }>(async (req, { params }) => {
  const admin = await requireAdmin();
  const { qid: rawQid } = await params;
  const qid = parseId(rawQid, 'Question');
  const question = await svc.updateQuestion(qid, await readJson(req, dailyQuestionInputSchema), admin);
  return ok(question);
});

export const DELETE = route<{ qid: string }>(async (_req, { params }) => {
  const admin = await requireAdmin();
  const { qid: rawQid } = await params;
  const qid = parseId(rawQid, 'Question');
  await svc.removeQuestion(qid, admin);
  return ok({ deleted: true });
});
