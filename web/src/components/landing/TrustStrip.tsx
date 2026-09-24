import type { ReactNode } from "react";
import { Container } from "@/components/ui";

export function TrustStrip() {
  return (
    <div className="border-y border-line/60 bg-sunken/60 py-4">
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600/70 sm:block">
            Built for nursing students
          </span>
          <span className="hidden h-3.5 w-px bg-line-strong sm:block" aria-hidden="true" />
          <Feature label="Timed Tests"><ClockSvg /></Feature>
          <Dot />
          <Feature label="Detailed Explanations"><DocSvg /></Feature>
          <Dot />
          <Feature label="Exam-Level MCQs"><TargetSvg /></Feature>
          <Dot />
          <Feature label="Progress Tracking"><TrendSvg /></Feature>
        </div>
      </Container>
    </div>
  );
}

function Feature({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-ink-2">
      <span className="size-4 shrink-0 text-brand-500">{children}</span>
      {label}
    </div>
  );
}

function Dot() {
  return <span className="hidden text-line-strong sm:inline" aria-hidden="true">·</span>;
}

function ClockSvg() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 4.5v3.5l2.25 2.25" />
    </svg>
  );
}

function DocSvg() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="1.5" width="10" height="13" rx="1.5" strokeLinejoin="round" />
      <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" />
    </svg>
  );
}

function TargetSvg() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" />
      <circle cx="8" cy="8" r="3.25" />
      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TrendSvg() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1.5 11.5 5.5 7l3 3 5-5.5" />
      <path d="M11 5h3.5v3.5" />
    </svg>
  );
}
