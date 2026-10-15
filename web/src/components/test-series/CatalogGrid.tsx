'use client';

import { CourseCatalog } from '@/components/course/CourseCatalog';
import type { Course, PublicTestSeries } from '@/types';

export interface CatalogGridProps {
  courses?: Course[] | null;
  series?: PublicTestSeries[] | null;
}

export interface CourseGroup {
  courseId: string;
  title: string;
  description: string | null;
  isFree: boolean;
  price: number;
  discountPrice: number | null;
  thumbnailUrl: string | null;
  tests: PublicTestSeries[];
}

/**
 * Re-export CourseCatalog to ensure all course listings display
 * strictly parent course cards only (Paid Course Series & Free Test Series).
 */
export function CatalogGrid({ courses = [] }: CatalogGridProps) {
  return <CourseCatalog courses={courses || []} />;
}
