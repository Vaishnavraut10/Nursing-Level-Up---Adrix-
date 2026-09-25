import Link from 'next/link';
import type { Course, PublicTestSeries } from '@/types';

interface CourseCardProps {
  course: Course;
  tests?: PublicTestSeries[];
  hasAccess?: boolean;
}

export function CourseCard({ course, tests = [] }: CourseCardProps) {
  const isFree = Boolean(course.is_free || Number(course.price) === 0);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-md">
      {/* 1. Course Thumbnail */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-sunken border-b border-line/60">
        {course.thumbnail_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-6 text-center text-white">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-brand-200">Nursing Course</div>
              <div className="mt-1 font-serif text-xl font-bold">{course.title}</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* 2. Category & Price Badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-50 text-brand-700 text-xs font-bold">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 2a2 2 0 0 0-2 2v2H7a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2V4a2 2 0 0 0-2-2h-2z" />
              </svg>
            </span>
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Nursing Exam
            </span>
          </div>

          {isFree ? (
            <span className="inline-flex items-center rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 ring-1 ring-inset ring-emerald-600/30">
              FREE
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-brand-50 px-2.5 py-0.5 text-xs font-extrabold text-brand-700 ring-1 ring-inset ring-brand-200/60">
              ₹{course.price}
            </span>
          )}
        </div>

        {/* 3. Title & Description */}
        <div className="mt-4 flex-1">
          <h3 className="font-serif text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-brand-700">
            <Link href={`/course?id=${course.id}`}>
              {course.title}
            </Link>
          </h3>
          {course.description && (
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted line-clamp-2">
              {course.description}
            </p>
          )}
        </div>

        {/* 4. Included Tests Section */}
        {tests.length > 0 && (
          <div className="mt-6 border-t border-line/70 pt-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted mb-3">
              <span>Tests included</span>
              <span className="text-brand-700 font-bold">{tests.length} Total</span>
            </div>

            <div className="space-y-2">
              {tests.slice(0, 4).map((ts, idx) => (
                <Link
                  key={ts.id}
                  href={ts.has_access || ts.is_free ? `/tests/${ts.id}` : `/course?id=${course.id}`}
                  className="flex items-center justify-between rounded-xl border border-line/50 bg-paper/60 px-3 py-2 text-xs transition-colors hover:border-brand-300 hover:bg-surface"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-[11px] font-bold text-muted/70 w-5 shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-medium text-ink truncate max-w-[180px] sm:max-w-[220px]">
                      {ts.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-[11px] text-muted font-medium">
                    <span>{ts.question_count} Q</span>
                    <span>{ts.duration_minutes} min</span>
                    <span className="text-brand-600 font-bold">→</span>
                  </div>
                </Link>
              ))}

              {tests.length > 4 && (
                <Link
                  href={`/course?id=${course.id}`}
                  className="block text-center text-xs font-semibold text-brand-700 hover:underline pt-1"
                >
                  + {tests.length - 4} more tests included →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
