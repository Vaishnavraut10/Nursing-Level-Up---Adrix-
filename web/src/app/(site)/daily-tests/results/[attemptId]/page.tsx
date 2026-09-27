import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ButtonLink, Container, EmptyState } from '@/components/ui';
import { DailyScoreSummary, DailyQuestionReview } from '@/components/results/DailyTestResultView';
import { requireUserPage } from '@/lib/server/session';
import { getResult } from '@/lib/server/services/dailyTestService';
import { ApiError } from '@/lib/errors';
import { uuidSchema } from '@/lib/validation';

export const metadata: Metadata = { title: 'Daily Test Result' };
export const dynamic = 'force-dynamic';

export default async function DailyTestResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  if (!uuidSchema.safeParse(attemptId).success) notFound();
  const user = await requireUserPage(`/daily-tests/results/${attemptId}`);

  let result;
  try {
    result = await getResult(user, attemptId);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    if (err instanceof ApiError && (err.status === 403 || err.status === 409)) {
      return (
        <Container className="py-16">
          <EmptyState
            title={err.status === 403 ? 'This result belongs to another student' : 'This test has not been submitted yet'}
            description={err.status === 403 ? 'You can only view results for your own test attempts.' : 'Finish the test to see your score and answer review.'}
            action={<ButtonLink href="/daily-tests" variant="secondary">Go to Daily Tests</ButtonLink>}
          />
        </Container>
      );
    }
    throw err;
  }

  return (
    <Container className="max-w-4xl py-12">
      <DailyScoreSummary result={result} />
      <div className="mt-6 flex flex-wrap gap-2">
        <ButtonLink href={`/daily-tests/${result.daily_test_id}`}>Retake test</ButtonLink>
        <ButtonLink href="/daily-tests" variant="secondary">Back to Daily Tests</ButtonLink>
        <ButtonLink href="/dashboard" variant="ghost">Go to Dashboard</ButtonLink>
      </div>
      <h2 className="mb-4 mt-12 font-serif text-2xl font-semibold text-ink">Question-wise Review</h2>
      <DailyQuestionReview result={result} />
    </Container>
  );
}
