import type { Metadata } from 'next';
import { listPublishedCourses } from '@/lib/server/services/courseService';
import { CourseCatalog } from '@/components/course/CourseCatalog';

export const metadata: Metadata = {
  title: 'Courses & Test Series — Nursing Level Up',
  description: 'Exam-level nursing MCQ test series courses with explained answers. Start free or enroll in comprehensive course passes.',
};

export const dynamic = 'force-dynamic';

export default async function TestSeriesPage() {
  const courses = await listPublishedCourses();
  return <CourseCatalog courses={courses} />;
}
