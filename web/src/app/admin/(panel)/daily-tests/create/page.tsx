import { AdminHeader } from '@/components/admin/shared';
import { DailyTestForm } from '@/components/admin/DailyTestForm';

export const metadata = { title: 'Create Daily Test — Admin' };

export default function CreateDailyTestPage() {
  return (
    <>
      <AdminHeader
        title="Create Daily Test"
        description="Fill in the test details below, then click 'Create and add questions' to add questions."
      />
      <DailyTestForm />
    </>
  );
}
