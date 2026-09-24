import type { ReactNode } from "react";
import { Container } from "@/components/ui";

export function ProgressSection() {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const pct = 76;
  const dash = (pct / 100) * circ;

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 dot-pattern opacity-20" aria-hidden="true" />
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* Left: progress visual */}
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-4 rounded-3xl bg-brand-500/5 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-2xl border border-line/70 bg-surface p-6 shadow-xl shadow-brand-800/8">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-200/60 to-transparent" aria-hidden="true" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Your progress</span>
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">This week</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                {/* Progress ring */}
                <div className="flex flex-col items-center justify-center rounded-xl bg-sunken/60 py-5">
                  <svg width="88" height="88" viewBox="0 0 88 88" aria-label={"Overall accuracy " + pct + " percent"}>
                    <circle cx="44" cy="44" r={r} fill="none" stroke="var(--color-brand-100)" strokeWidth="8" />
                    <circle
                      cx="44" cy="44" r={r} fill="none"
                      stroke="var(--color-brand-500)" strokeWidth="8"
                      strokeDasharray={dash + " " + (circ - dash)}
                      strokeLinecap="round"
                      transform="rotate(-90 44 44)"
                    />
                    <text x="44" y="44" textAnchor="middle" dominantBaseline="middle" fontSize="17" fontWeight="600" fill="var(--color-ink)">
                      {pct}%
                    </text>
                  </svg>
                  <div className="mt-2 text-xs font-medium text-muted">Overall accuracy</div>
                </div>

                {/* Mini stats */}
                <div className="space-y-2.5">
                  <MiniStat label="Tests completed" value="3" note="+1 this week" />
                  <MiniStat label="Qns answered" value="47" note="+12 today" />
                  <MiniStat label="Best score" value="84%" note="Pharmacology" />
                </div>
              </div>

              {/* Score trend */}
              <div className="mt-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-xs font-medium text-ink-2">Score trend</span>
                  <span className="text-[10px] text-faint">Last 5 attempts</span>
                </div>
                <div className="flex h-14 items-end gap-1.5">
                  {[55, 62, 58, 70, 78].map((h, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
                      <div className="w-full rounded-t-sm bg-brand-500" style={{ height: h + "%" }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent attempt */}
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-brand-100 bg-brand-50/50 px-4 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-sm text-white">78</div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-xs font-medium text-ink">Nursing Fundamentals</div>
                  <div className="text-[10px] text-muted">Completed today</div>
                </div>
                <span className="text-xs font-semibold text-brand-600">View</span>
              </div>
            </div>
          </div>

          {/* Right: text */}
          <div className="order-1 lg:order-2">
            <SectionTag>Track your growth</SectionTag>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              See your preparation move forward.
            </h2>
            <p className="mt-5 text-[1.05rem] leading-relaxed text-ink-2">
              Your dashboard gives you a clear view of how you are improving — scores,
              accuracy, and every attempt, all in one place.
            </p>
            <ul className="mt-8 space-y-4">
              {PROGRESS_FEATURES.map((f) => (
                <li key={f.title} className="flex gap-3.5">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-100">
                    <svg className="size-3 text-brand-600" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1.5 6l3.5 3.5 5.5-5.5" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-ink">{f.title}</div>
                    <div className="mt-0.5 text-sm text-muted">{f.body}</div>
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

function MiniStat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-lg border border-line/60 bg-surface p-3">
      <div className="font-serif text-lg font-semibold text-ink">{value}</div>
      <div className="text-[10px] text-muted">{label}</div>
      <div className="mt-0.5 text-[10px] font-medium text-brand-600">{note}</div>
    </div>
  );
}

const PROGRESS_FEATURES = [
  { title: "Attempt history", body: "Every test you take is saved with your score and individual answers." },
  { title: "Accuracy tracking", body: "See what percentage of questions you are getting right over time." },
  { title: "Score trends", body: "A visual chart shows whether your scores are improving across attempts." },
  { title: "Best and average scores", body: "Know your strongest and most consistent performance at a glance." },
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
