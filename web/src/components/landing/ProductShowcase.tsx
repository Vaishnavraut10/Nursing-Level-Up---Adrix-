import type { ReactNode } from "react";
import { Container, ButtonLink } from "@/components/ui";

export function ProductShowcase() {
  return (
    <section className="relative overflow-hidden bg-sunken/30 py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-40" aria-hidden="true" />
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* Left: editorial text */}
          <div>
            <SectionTag>Your preparation, all in one place</SectionTag>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.6rem]">
              Everything you need to prepare with confidence.
            </h2>
            <p className="mt-5 text-[1.05rem] leading-relaxed text-ink-2">
              NurseLearn brings together timed tests, detailed explanations, and progress
              tracking in one focused platform — so you practice effectively and enter the exam confident.
            </p>
            <ul className="mt-8 space-y-3.5">
              {PLATFORM_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-ink-2">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <svg className="size-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" />
                    </svg>
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <ButtonLink href="/test-series" className="rounded-full px-7 shadow-sm">
                Browse Test Series
              </ButtonLink>
            </div>
          </div>

          {/* Right: Illustrative dashboard card */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-brand-500/5 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-2xl border border-line/70 bg-surface shadow-2xl shadow-brand-800/10">

              {/* Window chrome */}
              <div className="flex items-center justify-between border-b border-line/70 bg-sunken/60 px-5 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-bad/40" />
                  <span className="size-2.5 rounded-full bg-warn/40" />
                  <span className="size-2.5 rounded-full bg-ok/40" />
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-semibold text-brand-700">Your Dashboard</span>
                <div className="flex size-7 items-center justify-center rounded-full bg-brand-700 text-[11px] font-bold text-white">A</div>
              </div>

              <div className="p-5">
                {/* Welcome */}
                <div className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Welcome back, Aryan</div>

                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-2.5">
                  <StatCard label="Tests done" value="3" />
                  <StatCard label="Avg score" value="76%" />
                  <StatCard label="Qns answered" value="47" />
                </div>

                {/* Score chart */}
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-ink-2">Score trend</span>
                    <span className="text-[10px] text-muted">Last 5 tests</span>
                  </div>
                  <div className="flex h-20 items-end gap-1.5 rounded-lg bg-sunken/50 px-3 pb-2 pt-3">
                    {[55, 62, 58, 70, 78].map((h, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center">
                        <div className="w-full rounded-t-md bg-brand-500" style={{ height: h + "%" }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Latest attempt */}
                <div className="mt-3.5 rounded-xl border border-line/60 bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-wide text-muted">Latest attempt</div>
                      <div className="mt-0.5 font-serif text-sm font-semibold text-ink">Nursing Fundamentals</div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif text-2xl font-semibold text-brand-600">78%</div>
                      <div className="text-[10px] text-muted">19/24 correct</div>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-brand-50">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: "78%" }} />
                  </div>
                </div>

                {/* Continue row */}
                <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-700/5 px-4 py-3">
                  <span className="text-sm font-medium text-ink">Continue preparing</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                    Browse tests
                    <svg className="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 6h8M6 2l4 4-4 4" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line/60 bg-surface p-3 text-center">
      <div className="font-serif text-xl font-semibold text-ink">{value}</div>
      <div className="mt-0.5 text-[10px] leading-tight text-muted">{label}</div>
    </div>
  );
}

const PLATFORM_FEATURES = [
  "Timed, exam-level test series for systematic practice",
  "Instant results with detailed explanations for every answer",
  "Personal dashboard tracking your scores and accuracy",
  "Free tests available — no payment required to start",
];

function SectionTag({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
      <span className="h-px w-6 bg-brand-500/50" aria-hidden="true" />
      {children}
      <span className="h-px w-3 bg-brand-500/30" aria-hidden="true" />
    </div>
  );
}
