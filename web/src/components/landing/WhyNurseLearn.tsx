import type { ReactNode } from "react";
import { Container } from "@/components/ui";

export function WhyNurseLearn() {
  return (
    <section className="py-32 lg:py-44">
      <Container>
        <div className="text-center">
          <SectionTag className="justify-center">Why NurseLearn</SectionTag>
          <h2 className="mt-4 font-serif text-5xl font-semibold tracking-tight sm:text-6xl">
            Preparation designed for nursing,<br className="hidden sm:block" /> not generic test-taking.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[1.1rem] leading-relaxed text-muted">
            Built specifically around nursing education — the topics, the clinical reasoning,
            and the exam format that nursing students actually face.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((r) => (
            <div
              key={r.title}
              className="group relative flex gap-5 overflow-hidden rounded-2xl border border-line/60 bg-surface p-8 card-hover"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-200/50 to-transparent" aria-hidden="true" />
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-600 shadow-sm">
                <svg className="size-4 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1.5 6l3.5 3.5 5.5-5.5" />
                </svg>
              </span>
              <div>
                <div className="text-base font-semibold text-ink transition-colors group-hover:text-brand-700">{r.title}</div>
                <div className="mt-2 text-[0.95rem] leading-relaxed text-muted">{r.body}</div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

const REASONS = [
  {
    title: "Exam-focused practice",
    body: "Questions are structured like actual nursing entrance and competency exams.",
  },
  {
    title: "Timed test experience",
    body: "Practice with a real countdown timer and question navigator — just like the real exam.",
  },
  {
    title: "Clear explanations for every answer",
    body: "Every question includes a detailed clinical rationale, not just the correct option.",
  },
  {
    title: "Structured test series",
    body: "Organized by topic so you can practice systematically and close knowledge gaps.",
  },
  {
    title: "Progress and accuracy tracking",
    body: "Your dashboard tracks attempts, scores, and improvement across every session.",
  },
  {
    title: "Created by a nursing professional",
    body: "Content is authored and reviewed by an active nursing officer against current curricula.",
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
