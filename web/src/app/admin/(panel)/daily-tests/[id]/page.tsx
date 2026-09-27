import { notFound } from 'next/navigation';
import { AdminHeader } from '@/components/admin/shared';
import { DailyTestForm } from '@/components/admin/DailyTestForm';
import { DailyQuestionManager } from '@/components/admin/DailyQuestionManager';
import { adminGet, listQuestionsForAdmin } from '@/lib/server/services/dailyTestService';

export const metadata = { title: 'Edit Daily Test — Admin' };

export default async function DailyTestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let test;
  let questions = [];
  try {
    test = await adminGet(id);
    questions = await listQuestionsForAdmin(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-8">
      <AdminHeader
        title={test.title}
        description={`Date: ${test.test_date} · Total Questions: ${questions.length} · Total Marks: ${test.total_marks}`}
      />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-ink">Test Configuration</h2>
        <DailyTestForm initial={test} />
      </section>

      <section>
        <DailyQuestionManager dailyTestId={test.id} initial={questions} />
      </section>
    </div>
  );
}
