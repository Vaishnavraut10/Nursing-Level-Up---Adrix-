import Link from 'next/link';
import { getCurrentUser } from '@/lib/server/session';
import { ButtonLink } from '@/components/ui';
import { Logo } from './Logo';
import { UserMenu } from './UserMenu';

/** Server-rendered: the nav reflects the server session, never client-side guesses (Frontend doc §2). */
export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-30 border-b border-line/60 glass shadow-sm">
      <div className="mx-auto flex h-[4.25rem] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <Logo />
        <nav className="flex items-center gap-1" aria-label="Main">
          <Link
            href="/test-series"
            className="rounded-lg px-4 py-2 text-sm font-medium tracking-[-0.01em] text-ink-2 transition-colors hover:bg-brand-50 hover:text-brand-700"
          >
            Test Series
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden rounded-lg px-4 py-2 text-sm font-medium tracking-[-0.01em] text-ink-2 transition-colors hover:bg-brand-50 hover:text-brand-700 sm:block"
              >
                Dashboard
              </Link>
              <UserMenu name={user.name} email={user.email} />
            </>
          ) : (
            <ButtonLink
              href="/login"
              size="sm"
              className="ml-3 rounded-full px-5 text-xs font-semibold tracking-wide"
            >
              Log in
            </ButtonLink>
          )}
        </nav>
      </div>
    </header>
  );
}
