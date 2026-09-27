import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DailyTestRunner } from '@/components/test/DailyTestRunner';
import { requireStudentPage } from '@/lib/server/session';
import { getPublished } from '@/lib/server/services/dailyTestService';
import { uuidSchema } from '@/lib/validation';

export const metadata: Metadata = { title: 'Daily Test' };
export const dynamic = 'force-dynamic';

export default async function DailyTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const user = await requireStudentPage(`/daily-tests/${id}`);
  const test = await getPublished(id, user);
  if (!test) notFound();

  return (
    <DailyTestRunner
      dailyTestId={test.id}
      title={test.title}
      durationMinutes={test.duration_minutes}
      questionCount={test.question_count}
      instructions={test.instructions}
      totalMarks={test.total_marks}
    />
  );
}
