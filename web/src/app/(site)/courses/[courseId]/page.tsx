import CoursePage from '../../course/page';

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return CoursePage({ searchParams: Promise.resolve({ id: courseId }) });
}
