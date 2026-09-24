import { NextResponse } from 'next/server';
import { getPublishedCourse } from '@/lib/server/services/courseService';

export async function GET() {
  const course = await getPublishedCourse();
  if (!course) {
    return NextResponse.json({ course: null });
  }
  // Don't expose promo_code to client — they must submit it to validate
  const { promo_code: _, ...publicCourse } = course;
  return NextResponse.json({
    course: { ...publicCourse, has_promo: Boolean(course.promo_code) },
  });
}
