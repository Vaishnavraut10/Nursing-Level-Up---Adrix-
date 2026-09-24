import type { ReactNode } from "react";
import { Container } from "@/components/ui";

export function HowItWorks() {
  return (
    <section className="relative border-y border-line/50 bg-sunken/40 py-24 lg:py-32" aria-labelledby="how-heading">
      <div className="pointer-events-none absolute inset-0 dot-pattern opacity-25" aria-hidden="true" />
      <Container className="relative">
        <div className="text-center">
          <SectionTag className="justify-center">How it works</SectionTag>
          <h2 id="how-heading" className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            From practice to progress.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Three focused steps from choosing a test to understanding every answer.
          </p>
        </div>

        <div className="relative mt-16">
          <div
            className="pointer-events-none absolute left-[calc(16.7%+2.5rem)] right-[calc(16.7%+2.5rem)] top-10 hidden h-px bg-gradient-to-r from-brand-200/40 via-brand-300/60 to-brand-200/40 sm:block"
            aria-hidden="true"
          />
          <ol className="grid gap-10 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step) => (
              <li key={step.n} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 mb-5 flex size-20 items-center justify-center rounded-full border-2 border-brand-200/80 bg-surface shadow-md shadow-brand-500/10">
                  <div className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    {step.icon}
                  </div>
                  <span className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white shadow-sm ring-2 ring-surface">
                    {step.n}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 max-w-[18rem] text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

const STEPS: { n: string; title: string; body: string; icon: ReactNode }[] = [
  {
    n: "1",
    title: "Choose your test",
    body: "Start with a free practice test or unlock a full exam-level series. Structured by topic.",
    icon: (
      <svg className="size-7" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="3" width="18" height="22" rx="2.5" />
        <path d="M9 9h10M9 13h10M9 17h6" />
      </svg>
    ),
  },
  {
    n: "2",
    title: "Attempt under real conditions",
    body: "A countdown timer, question navigator, and mark-for-review — just like the actual exam.",
    icon: (
      <svg className="size-7" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="14" cy="14" r="10" />
        <path d="M14 7.5V14.5l4.5 4.5" />
      </svg>
    ),
  },
  {
    n: "3",
    title: "Review. Learn. Improve.",
    body: "Instant results with the correct answer and a detailed explanation for every question.",
    icon: (
      <svg className="size-7" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="14" cy="14" r="10" />
        <path d="M9 14l4 4 6.5-6.5" />
      </svg>
    ),
  },
];

function SectionTag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={"flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600 " + (className ?? "")}>
      <span className="h-px w-6 bg-brand-500/50" aria-hidden="true" />
      {children}
      <span className="h-px w-3 bg-brand-500/30" aria-hidden="true" />
    </div>
  );
}
