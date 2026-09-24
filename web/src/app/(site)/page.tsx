import Link from "next/link";
import { ButtonLink, Container, EmptyState } from "@/components/ui";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { TestSeriesCard } from "@/components/test-series/TestSeriesCard";
import { SampleQuestion } from "@/components/test-series/SampleQuestion";
import { getCurrentUser } from "@/lib/server/session";
import { listPublished } from "@/lib/server/services/testSeriesService";
import { getPublishedCourse, hasCoursePurchase } from "@/lib/server/services/courseService";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TestExperience } from "@/components/landing/TestExperience";
import { ExplanationSection } from "@/components/landing/ExplanationSection";
import { ProgressSection } from "@/components/landing/ProgressSection";
import { WhyNurseLearn } from "@/components/landing/WhyNurseLearn";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const user = await getCurrentUser();
  const [course, series] = await Promise.all([
    getPublishedCourse(),
    listPublished(user),
  ]);
  const hasCourseAccess = course && user ? await hasCoursePurchase(user.id, course.id) : false;
  const free = series.filter((s) => s.is_free);
  const paid = series.filter((s) => !s.is_free);
  const firstFree = free[0];

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-70" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -right-20 top-20 size-72 rounded-full bg-brand-100/25 blur-3xl animate-float-slow" />
          <div className="absolute -left-16 bottom-10 size-56 rounded-full bg-accent-50/30 blur-3xl animate-float-slow stagger-3" />
          <div className="absolute left-1/2 top-10 size-40 rounded-full bg-brand-50/40 blur-2xl animate-float stagger-2" />
        </div>

        <Container className="relative grid items-center gap-12 py-14 md:grid-cols-[1.15fr_1fr] md:py-20 lg:py-28">
          <div className="animate-slide-up">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-brand-200/60 bg-white/70 px-4 py-1.5 text-xs font-medium tracking-wide text-brand-700 backdrop-blur-sm shadow-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500 opacity-50" />
                <span className="relative inline-flex size-2 rounded-full bg-brand-500" />
              </span>
              Nursing MCQ practice
            </div>

            <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.04] tracking-tight sm:text-[3.25rem] lg:text-[3.75rem]">
              Practice smarter.
              <br />
              <span className="text-gradient">Prepare better.</span>
            </h1>

            <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-ink-2">
              Timed, exam-level test series crafted for nursing students — with a clear
              explanation behind every answer.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3.5">
              <ButtonLink href="/course" size="lg" className="rounded-full px-7 shadow-md shadow-brand-700/15">
                Explore Course Pass
              </ButtonLink>
              <ButtonLink
                href="/test-series"
                size="lg"
                variant="secondary"
                className="rounded-full px-7"
              >
                Browse All Tests
              </ButtonLink>
            </div>

            {/* Stats strip */}
            <div className="mt-12 border-t border-line/50 pt-7">
              <dl className="flex items-stretch gap-0">
                <div className="animate-fade-up stagger-1 flex-1 pr-6">
                  <dd className="font-serif text-4xl font-semibold text-ink tabular-nums">{series.length > 0 ? series.length : '200+'}</dd>
                  <dt className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-muted">Test series</dt>
                </div>
                <div className="self-stretch w-px bg-line" aria-hidden="true" />
                <div className="animate-fade-up stagger-2 flex-1 px-6">
                  <dd className="font-serif text-4xl font-semibold text-ink tabular-nums">{free.length}</dd>
                  <dt className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-muted">Free to start</dt>
                </div>
                <div className="self-stretch w-px bg-line" aria-hidden="true" />
                <div className="animate-fade-up stagger-3 flex-1 pl-6">
                  <dd className="font-serif text-4xl font-semibold text-ink">&#x20B9;299</dd>
                  <dt className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-muted">Course pass</dt>
                </div>
              </dl>
            </div>
          </div>

          <div className="animate-scale-in stagger-2">
            <SampleQuestion />
          </div>
        </Container>
      </section>

      {/* ── Trust Strip ── */}
      <TrustStrip />

      {/* ── Product Showcase ── */}
      <ProductShowcase />

      {/* ── How It Works ── */}
      <HowItWorks />

      {/* ── Test Experience ── */}
      <TestExperience />

      {/* ── Explanation ── */}
      <ExplanationSection />

      {/* ── Test Series (real data) ── */}
      <section className="py-24 lg:py-32" id="series">
        <Container>
          <ScrollReveal>
            <SectionTag>Start here</SectionTag>
            <div className="mt-3 flex items-end justify-between gap-4">
              <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Free test series</h2>
              <Link href="/test-series" className="shrink-0 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700">
                View all <span className="ml-0.5">→</span>
              </Link>
            </div>
          </ScrollReveal>
          {free.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {free.map((s, i) => (
                <ScrollReveal key={s.id} stagger={i * 70}>
                  <TestSeriesCard series={s} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState title="No free tests yet" description="New practice tests are added regularly." />
            </div>
          )}

          <div className="mt-20 flex items-center gap-5" aria-hidden="true">
            <div className="h-px flex-1 bg-line/50" />
            <div className="flex size-7 items-center justify-center rounded-full border border-line/70 text-faint">
              <svg className="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 6h8M6 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="h-px flex-1 bg-line/50" />
          </div>

          {/* Featured Course Showcase */}
          {course && (
            <div className="mt-14 overflow-hidden rounded-3xl border border-brand-200/80 bg-gradient-to-br from-surface via-surface to-brand-50/40 p-7 sm:p-10 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200/60">
                    <span className="size-1.5 rounded-full bg-brand-500" />
                    Complete Course
                  </div>
                  <h3 className="mt-3 font-serif text-2xl sm:text-3xl font-semibold text-ink">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base leading-relaxed text-muted">
                    {course.description ||
                      'The all-in-one preparation program with up to 200+ timed MCQ test series. Series 1 unlocks immediately, with new series released every day at 5:00 PM IST.'}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-ink-2">
                    <span className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-ok" /> Up to 200+ Test Series
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-amber-500" /> Daily 5 PM IST Unlocks
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-brand-500" /> ₹{course.price} ({course.promo_code ? `₹${course.discount_price} with code ${course.promo_code}` : 'Full Access'})
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                  <ButtonLink href="/course" size="lg" className="rounded-2xl px-6 shadow-xs font-semibold">
                    View Course & Solve Tests →
                  </ButtonLink>
                </div>
              </div>
            </div>
          )}

          <ScrollReveal className="mt-14">
            <SectionTag>Course Curriculum</SectionTag>
            <div className="mt-3 flex items-end justify-between gap-4">
              <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Course test series</h2>
              <Link href="/course" className="shrink-0 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700">
                View all in course <span className="ml-0.5">→</span>
              </Link>
            </div>
          </ScrollReveal>
          {paid.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paid.map((s, i) => (
                <ScrollReveal key={s.id} stagger={i * 70}>
                  <TestSeriesCard series={s} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState title="Course test series are on their way" />
            </div>
          )}
        </Container>
      </section>

      {/* ── Progress Visual ── */}
      <ProgressSection />

      {/* ── Creator / Credibility ── */}
      <section className="py-32 lg:py-44">
        <Container>
          <ScrollReveal>
            {/* Section title */}
            <div className="mb-16 text-center">
              <SectionTag className="justify-center mb-5">Our team</SectionTag>
              <h2 className="font-serif text-5xl font-semibold tracking-tight sm:text-6xl lg:text-[4rem]">Meet the creators</h2>
              <p className="mx-auto mt-5 max-w-2xl text-[1.1rem] leading-relaxed text-ink-2">
                Built by nursing professionals who've been through the exams themselves — every question is crafted from real clinical experience.
              </p>
            </div>
            <div className="grid gap-10 sm:grid-cols-2">
              {/* Card 1 – Dhruva Thakre */}
              <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-600 shadow-2xl shadow-brand-900/30">
                <div className="flex items-center gap-4 border-b border-white/10 px-10 py-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-200/70">Created by a nursing professional</div>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="flex flex-col items-center gap-6 px-10 py-12 text-center sm:px-14">
                  {/* Avatar – centered & big */}
                  <div className="relative">
                    <div className="flex size-36 items-center justify-center rounded-3xl bg-white/10 font-serif text-5xl font-semibold text-white ring-2 ring-white/20 backdrop-blur-sm">
                      DT
                    </div>
                    <div className="absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-full bg-brand-500 ring-2 ring-brand-700">
                      <svg className="size-4 text-white" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M9.5 3.5 5 8 2.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    </div>
                  </div>
                  {/* Info below avatar */}
                  <div>
                    <h2 className="font-serif text-3xl font-semibold leading-tight text-white">Dhruva Thakre</h2>
                    <p className="mt-2 text-base font-medium text-brand-100/80">Nursing Officer, GMCH Nagpur</p>
                    <div className="mt-1.5 flex items-center justify-center gap-2 text-sm text-brand-200/60">
                      <span>B.Sc. Nursing</span>
                      <span className="opacity-40">&middot;</span>
                      <span>Batch 2018, GMC Nagpur</span>
                    </div>
                  </div>
                  {/* Quote */}
                  <div className="w-full border-t border-white/10 pt-6">
                    <p className="text-base leading-relaxed text-brand-100/70">
                      Every question is written and reviewed against current nursing curricula, with explanations that
                      teach the reasoning — not just the answer.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2 – Aditya Bhajipale */}
              <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-600 shadow-2xl shadow-brand-900/30">
                <div className="flex items-center gap-4 border-b border-white/10 px-10 py-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-200/70">Created by a nursing professional</div>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="flex flex-col items-center gap-6 px-10 py-12 text-center sm:px-14">
                  {/* Avatar – centered & big */}
                  <div className="relative">
                    <div className="flex size-36 items-center justify-center rounded-3xl bg-white/10 font-serif text-5xl font-semibold text-white ring-2 ring-white/20 backdrop-blur-sm">
                      AB
                    </div>
                    <div className="absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-full bg-brand-500 ring-2 ring-brand-700">
                      <svg className="size-4 text-white" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M9.5 3.5 5 8 2.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    </div>
                  </div>
                  {/* Info below avatar */}
                  <div>
                    <h2 className="font-serif text-3xl font-semibold leading-tight text-white">Aditya Bhajipale</h2>
                    <p className="mt-2 text-base font-medium text-brand-100/80">Nursing Officer, GMCH Nagpur</p>
                    <div className="mt-1.5 flex items-center justify-center gap-2 text-sm text-brand-200/60">
                      <span>B.Sc. Nursing</span>
                      <span className="opacity-40">&middot;</span>
                      <span>Batch 2018, GMC Nagpur</span>
                    </div>
                  </div>
                  {/* Quote */}
                  <div className="w-full border-t border-white/10 pt-6">
                    <p className="text-base leading-relaxed text-brand-100/70">
                      Every question is written and reviewed against current nursing curricula, with explanations that
                      teach the reasoning — not just the answer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ── Why NurseLearn ── */}
      <WhyNurseLearn />

      {/* ── Final CTA ── */}
      {!user && (
        <section className="pb-24 lg:pb-32">
          <Container>
            <ScrollReveal>
              <div className="relative overflow-hidden rounded-2xl border border-brand-200/40 bg-surface px-8 py-20 text-center shadow-xl shadow-brand-700/8 sm:px-16 sm:py-24">
                <div className="pointer-events-none absolute inset-0 hero-gradient opacity-80" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-0 hero-grid opacity-50" aria-hidden="true" />
                <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-48 w-72 rounded-full bg-brand-500/10 blur-3xl" aria-hidden="true" />

                <div className="relative">
                  <SectionTag className="justify-center mb-5">Get started</SectionTag>
                  <h2 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
                    Ready for your first mock test?
                  </h2>
                  <p className="mx-auto mt-4 max-w-md text-[1.05rem] text-muted">
                    Sign in with Google to get started — it takes just a few seconds.
                  </p>
                  <div className="mt-10">
                    <ButtonLink
                      href="/login"
                      size="lg"
                      className="inline-flex items-center gap-2.5 rounded-full px-8 shadow-lg shadow-brand-700/20"
                    >
                      Get Started Free
                      <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 8h10M9 4l4 4-4 4" />
                      </svg>
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </section>
      )}
    </>
  );
}

function SectionTag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={"flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600 " + (className ?? "")}>
      <span className="h-px w-6 bg-brand-500/50" aria-hidden="true" />
      {children}
      <span className="h-px w-3 bg-brand-500/30" aria-hidden="true" />
    </div>
  );
}
