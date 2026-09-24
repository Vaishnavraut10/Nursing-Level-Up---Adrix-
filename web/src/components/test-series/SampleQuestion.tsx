'use client';

import { useState } from 'react';
import { cx } from '@/components/ui';

// Landing-page demo only: a fixed, unscored example that never talks to the backend (Frontend doc §3).
const SAMPLE = {
  question: 'A patient on heparin therapy for deep vein thrombosis is being monitored. Which laboratory value best reflects the effectiveness of heparin?',
  options: ['Prothrombin time (PT)', 'International normalised ratio (INR)', 'Activated partial thromboplastin time (aPTT)', 'Platelet count'],
  answer: 2,
  explanation: 'aPTT monitors unfractionated heparin; the usual target is 1.5–2.5 times the control value. PT/INR are used for warfarin.',
};

export function SampleQuestion() {
  const [picked, setPicked] = useState<number | null>(null);
  const revealed = picked !== null;

  return (
    <div className="overflow-hidden rounded-2xl border border-line/60 bg-surface shadow-2xl shadow-brand-800/10 ring-1 ring-black/[0.04]">
      {/* Chrome bar — decorative, mirrors the real test interface */}
      <div className="flex items-center justify-between border-b border-line/60 bg-sunken/60 px-5 py-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted">
          <span className="flex size-5 items-center justify-center rounded-md bg-brand-600 text-[10px] font-bold text-white">1</span>
          <span>of 20 questions</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold tabular-nums text-ink-2">
          <svg className="size-3.5 text-brand-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <circle cx="10" cy="10" r="7" opacity=".3" /><path d="M9.25 6h1.5v4.2l2.8 1.7-.8 1.3-3.5-2.1z" />
          </svg>
          <span>04</span>
          <span className="animate-pulse-soft">:</span>
          <span>32</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-line/40" aria-hidden="true">
        <div className="h-full w-[5%] bg-brand-500 transition-all" />
      </div>

      {/* Content */}
      <div className="p-5 sm:p-7">
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-brand-500 animate-pulse-soft" />
            Sample question
          </span>
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-brand-600">Pharmacology</span>
        </div>
        <p className="mt-5 font-serif text-[1.05rem] leading-[1.65] text-ink sm:text-[1.1rem]">{SAMPLE.question}</p>
        <div className="mt-5 space-y-2" role="radiogroup" aria-label="Options">
          {SAMPLE.options.map((opt, i) => {
            const correct = revealed && i === SAMPLE.answer;
            const wrong = revealed && i === picked && i !== SAMPLE.answer;
            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={picked === i}
                disabled={revealed}
                onClick={() => setPicked(i)}
                className={cx(
                  'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200',
                  !revealed && 'border-line bg-white/70 hover:border-brand-400/60 hover:bg-brand-50/50 hover:shadow-sm cursor-pointer',
                  correct && 'border-ok/40 bg-ok-50 text-ink shadow-sm shadow-ok/10',
                  wrong && 'border-bad/40 bg-bad-50 text-ink shadow-sm shadow-bad/10',
                  revealed && !correct && !wrong && 'border-line/50 text-muted bg-transparent',
                )}
              >
                <span
                  className={cx(
                    'flex size-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tracking-wide transition-all duration-200',
                    correct ? 'bg-ok text-white shadow-sm' : wrong ? 'bg-bad text-white shadow-sm' : 'border border-line-strong bg-sunken/80 text-ink-2',
                  )}
                >
                  {'ABCD'[i]}
                </span>
                <span className="leading-snug">{opt}</span>
              </button>
            );
          })}
        </div>
        {revealed && (
          <div className="animate-slide-up mt-4 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3.5 text-sm text-ink-2">
            <span className={cx('font-semibold', picked === SAMPLE.answer ? 'text-ok' : 'text-bad')}>
              {picked === SAMPLE.answer ? 'Correct! ' : 'Not quite. '}
            </span>
            {SAMPLE.explanation}
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="ml-2 font-medium text-brand-600 underline-offset-2 hover:underline transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
