import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line/50 bg-surface">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-8 py-10 sm:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Exam-level MCQ practice for nursing students and aspirants. Practice smarter, prepare better.
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">Practice</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link className="text-ink-2 transition-colors hover:text-brand-600" href="/test-series">All test series</Link></li>
              <li><Link className="text-ink-2 transition-colors hover:text-brand-600" href="/dashboard">Your dashboard</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">Account</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link className="text-ink-2 transition-colors hover:text-brand-600" href="/login">Log in</Link></li>
              <li><Link className="text-ink-2 transition-colors hover:text-brand-600" href="/profile">Profile</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line/40 py-5 text-xs text-faint">
          © {new Date().getFullYear()} Nursing Level Up. Payments are processed securely by Razorpay.
        </div>
      </div>
    </footer>
  );
}
