import Link from 'next/link';
import Image from 'next/image';

export function LogoMark({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#11504b" />
      <path d="M13 8h6v5h5v6h-5v5h-6v-5H8v-6h5z" fill="#faf8f4" />
      <path d="M8 27h16" stroke="#b4532a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-md transition-opacity hover:opacity-80" aria-label="Nursing Level Up home">
      <Image
        src="/images/logo.png"
        alt="Nursing Level Up - Knowledge | Skills | Success"
        width={220}
        height={64}
        className="h-14 w-auto object-contain"
        priority
      />
    </Link>
  );
}
