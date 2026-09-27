import { route, ok, created, parseId, readJson } from '@/lib/server/http';
import { requireAdmin } from '@/lib/server/session';
import * as svc from '@/lib/server/services/dailyTestService';
import { bulkDailyQuestionsSchema, dailyQuestionInputSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = route<{ id: string }>(async (_req, { params }) => {
  await requireAdmin();
  const { id: rawId } = await params;
  const id = parseId(rawId, 'Daily test');
  return ok(await svc.listQuestionsForAdmin(id));
});

export const POST = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin();
  const { id: rawId } = await params;
  const id = parseId(rawId, 'Daily test');
  const question = await svc.addQuestion(id, await readJson(req, dailyQuestionInputSchema), admin);
  return created(question);
});

export const PUT = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin();
  const { id: rawId } = await params;
  const id = parseId(rawId, 'Daily test');
  const body = await readJson(req, bulkDailyQuestionsSchema);
  const questions = await svc.saveBulkQuestions(id, body.questions, admin);
  return ok(questions);
});

