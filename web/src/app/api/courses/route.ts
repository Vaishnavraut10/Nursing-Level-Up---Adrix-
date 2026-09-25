import { NextResponse } from 'next/server';
import { listPublishedCourses } from '@/lib/server/services/courseService';

export async function GET() {
  const courses = await listPublishedCourses();
  return NextResponse.json({
    courses,
    course: courses[0] ?? null,
  });
}
