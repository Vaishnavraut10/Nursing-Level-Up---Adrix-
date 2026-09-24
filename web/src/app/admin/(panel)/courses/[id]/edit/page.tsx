import { notFound } from 'next/navigation';
import { AdminHeader } from '@/components/admin/shared';
import { CourseForm } from '@/components/admin/CourseForm';
import { adminGet } from '@/lib/server/services/courseService';
import { uuidSchema } from '@/lib/validation';

export const metadata = { title: 'Edit Course' };

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const course = await adminGet(id).catch(() => null);
  if (!course) notFound();

  return (
    <div className="max-w-3xl">
      <AdminHeader
        back={{ href: `/admin/courses/${id}`, label: course.title }}
        title={`Edit · ${course.title}`}
        description="Changes to title, price, discount price, or promo code will immediately reflect across the student website and checkout."
      />
      <CourseForm initial={course} />
    </div>
  );
}
