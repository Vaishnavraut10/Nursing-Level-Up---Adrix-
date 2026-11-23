import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { listPublishedCourses } from '@/lib/server/services/courseService';
import { listPublishedNotes } from '@/lib/server/services/noteService';
import { CourseCatalog } from '@/components/course/CourseCatalog';

export const metadata: Metadata = {
  title: 'Nursing Level Up — Nursing Exam Course Catalog',
  description:
    'Enroll in comprehensive nursing MCQ courses for NORCET, GMCH, AIIMS, and State Nursing Officer exams. Full access to structured test series with detailed rationales.',
};

export const dynamic = 'force-dynamic';

/**
 * Main Course Listing Page (Root `/`)
 * Displays course cards, categorized into Paid Course Series and Free Test Series,
 * alongside a featured preview section for Study Notes & Materials.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};
  if (sp.id) {
    redirect(`/course?id=${sp.id}`);
  }

  const [courses, notesData] = await Promise.all([
    listPublishedCourses(),
    listPublishedNotes({ page: 1, pageSize: 6 }),
  ]);

  return (
    <CourseCatalog
      courses={courses}
      notes={notesData.items}
      totalNotesCount={notesData.total}
    />
  );
}
