import { Container } from "@/components/ui";

export function ExplanationSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-800 py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-24 top-0 size-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -left-24 bottom-0 size-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 hero-grid opacity-10" />
      </div>

      <Container className="relative">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-200/80">
              <span className="h-px w-6 bg-brand-300/40" aria-hidden="true" />
              Learn as you practice
              <span className="h-px w-3 bg-brand-300/30" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Don't just know the answer.
              <br />
              <span className="text-brand-200">Understand why.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-brand-100/80">
              Every question includes a detailed explanation that teaches the clinical reasoning —
              not just the correct option.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl bg-surface shadow-2xl shadow-brand-900/30">
            {/* Card header */}
            <div className="flex items-center justify-between border-b border-line/60 bg-sunken/50 px-6 py-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-ok-50 px-2 py-0.5 text-xs font-semibold text-ok ring-1 ring-inset ring-ok/20">
                  Correct
                </span>
                <span className="text-xs text-muted">Question 3 of 20</span>
              </div>
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                Pharmacology
              </span>
            </div>

            <div className="p-6 sm:p-8">
              <p className="font-serif text-base leading-[1.65] text-ink sm:text-lg">
                Which laboratory value is the primary parameter for monitoring unfractionated heparin therapy?
              </p>

              <div className="mt-5 space-y-2">
                {EXPL_OPTIONS.map((opt) => (
                  <div
                    key={opt.letter}
                    className={"flex items-center gap-3 rounded-xl border px-4 py-3 text-sm " +
                      (opt.correct ? "border-ok/40 bg-ok-50 text-ink shadow-sm" : "border-line/50 text-muted")}
                  >
                    <span className={"flex size-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold " +
                      (opt.correct ? "bg-ok text-white shadow-sm" : "border border-line-strong bg-surface text-ink-2")}>
                      {opt.letter}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                    {opt.correct && (
                      <svg className="size-4 shrink-0 text-ok" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2.5 8l4 4 7-7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>

              {/* Explanation block */}
              <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-600">
                    <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 1v6M6 10v1" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">Explanation</div>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
                      <span className="font-semibold text-ok">aPTT (Activated Partial Thromboplastin Time)</span> is
                      the standard parameter for monitoring unfractionated heparin. The therapeutic target is
                      1.5–2.5 times the baseline value. PT and INR are used for warfarin monitoring, while
                      platelet count is relevant for detecting heparin-induced thrombocytopenia (HIT).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

const EXPL_OPTIONS = [
  { letter: "A", text: "Prothrombin time (PT)", correct: false },
  { letter: "B", text: "International normalised ratio (INR)", correct: false },
  { letter: "C", text: "Activated partial thromboplastin time (aPTT)", correct: true },
  { letter: "D", text: "Platelet count", correct: false },
];
