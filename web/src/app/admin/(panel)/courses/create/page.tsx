import { AdminHeader } from '@/components/admin/shared';
import { CourseForm } from '@/components/admin/CourseForm';

export const metadata = { title: 'New Course' };

export default function CreateCoursePage() {
  return (
    <div className="max-w-3xl">
      <AdminHeader
        back={{ href: '/admin/courses', label: 'Courses' }}
        title="New Course"
        description="Create a course pass. Test series can be assigned to this course and will be unlocked based on each student's drip schedule."
      />
      <CourseForm />
    </div>
  );
}
