import type { ReactNode } from "react";
import { Container } from "@/components/ui";

export function TestExperience() {
  return (
    <section className="relative overflow-hidden border-y border-line/50 bg-sunken/30 py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-40" aria-hidden="true" />
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* Left: Decorative MCQ mockup */}
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-4 rounded-3xl bg-brand-500/5 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-2xl border border-line/70 bg-surface shadow-2xl shadow-brand-800/10 ring-1 ring-black/[0.04]">
              {/* Chrome bar */}
              <div className="flex items-center justify-between border-b border-line/60 bg-sunken/60 px-5 py-2.5">
                <div className="flex items-center gap-2 text-xs font-medium text-muted">
                  <span className="flex size-5 items-center justify-center rounded-md bg-brand-600 text-[10px] font-bold text-white">4</span>
                  <span>of 25 questions</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs font-semibold tabular-nums text-ink-2">
                  <svg className="size-3.5 text-brand-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                    <circle cx="8" cy="8" r="6.25" />
                    <path d="M8 4.5v3.5l2.25 2.25" />
                  </svg>
                  <span>23:41</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-0.5 bg-line/30" aria-hidden="true">
                <div className="h-full bg-brand-500/70" style={{ width: "16%" }} />
              </div>

              <div className="p-5 sm:p-6">
                {/* Category badge */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 font-medium text-brand-700">Pharmacology</span>
                  <span className="text-faint">·</span>
                  <span className="font-medium text-faint">Drug Monitoring</span>
                </div>

                {/* Question */}
                <p className="mt-4 font-serif text-sm leading-[1.7] text-ink sm:text-[0.95rem]">
                  A patient on heparin therapy is being monitored. Which laboratory parameter
                  should the nurse assess for effectiveness?
                </p>

                {/* Options */}
                <div className="mt-4 space-y-2">
                  {MOCK_OPTIONS.map((opt) => (
                    <div
                      key={opt.letter}
                      className={"flex items-center gap-3 rounded-xl border px-4 py-3 text-sm " +
                        (opt.selected ? "border-brand-400/60 bg-brand-50/60" : "border-line/70 bg-surface/80")}
                    >
                      <span className={"flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold " +
                        (opt.selected ? "bg-brand-600 text-white" : "border border-line-strong bg-sunken text-ink-2")}>
                        {opt.letter}
                      </span>
                      <span className={opt.selected ? "font-medium text-ink" : "text-ink-2"}>{opt.text}</span>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="mt-5 flex items-center justify-between">
                  <button type="button" className="rounded-lg border border-line-strong px-4 py-2 text-xs font-medium text-ink-2 transition-colors hover:bg-sunken">
                    Previous
                  </button>
                  <button type="button" className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700">
                    Next question
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: editorial text */}
          <div className="order-1 lg:order-2">
            <SectionTag>The test experience</SectionTag>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Practice like it&apos;s the real thing.
            </h2>
            <p className="mt-5 text-[1.05rem] leading-relaxed text-ink-2">
              The test interface mirrors actual exam conditions — timed, focused, and built
              to build your confidence before the real day.
            </p>
            <ul className="mt-8 space-y-4">
              {EXAM_FEATURES.map((f) => (
                <li key={f.title} className="flex gap-3.5">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-100">
                    <svg className="size-3 text-brand-600" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1.5 6l3.5 3.5 5.5-5.5" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-ink">{f.title}</div>
                    <div className="mt-0.5 text-sm leading-relaxed text-muted">{f.body}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

const MOCK_OPTIONS = [
  { letter: "A", text: "Prothrombin time (PT)", selected: false },
  { letter: "B", text: "International normalised ratio (INR)", selected: false },
  { letter: "C", text: "Activated partial thromboplastin time (aPTT)", selected: true },
  { letter: "D", text: "Platelet count", selected: false },
];

const EXAM_FEATURES = [
  { title: "Timed conditions", body: "A live countdown timer keeps you aware of pacing — exactly like the real exam." },
  { title: "Clear answer choices", body: "Four clearly formatted options per question, styled for focus and readability." },
  { title: "Instant, server-verified results", body: "Scores are calculated and verified on the server — no client-side tricks." },
  { title: "Explanation for every answer", body: "Every question reveals the correct answer with a detailed clinical rationale." },
  { title: "Question navigator", body: "Jump between questions, mark them for review, and track your progress mid-test." },
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
