'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Alert, Button, Field, Input, cx } from '@/components/ui';
import { parseAuthIdentifier, phoneSchema } from '@/lib/validation';

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="size-4 text-faint" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.161V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48 1.01a11.192 11.192 0 0 0 4.17 5.174c.394.267.87.164 1.134-.176l.666-.856a1.5 1.5 0 0 1 1.898-.44l3.125 1.562a1.5 1.5 0 0 1 .833 1.342V16.5A1.5 1.5 0 0 1 16.5 18h-1C7.49 18 2 12.51 2 4.5v-1Z" clipRule="evenodd" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}

function ContactIcon({ value }: { value: string }) {
  const trimmed = value.trim();
  if (trimmed.includes('@')) {
    return <MailIcon />;
  }
  if (/^[0-9+\s\-().]+$/.test(trimmed) && trimmed.length >= 2) {
    return <PhoneIcon />;
  }
  return <UserIcon />;
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.092 1.092a4 4 0 0 0-5.558-5.558Z" clipRule="evenodd" />
      <path d="M10.748 13.93 8.07 11.25A2.495 2.495 0 0 0 10 12.5c.089 0 .176-.005.262-.013L10.748 13.93ZM7.4 12.9l-3.742-3.742A10.059 10.059 0 0 0 .664 10.6a1.651 1.651 0 0 0 0 1.186A10.004 10.004 0 0 0 10 18c.791 0 1.568-.09 2.314-.268L10.6 16.018A8.502 8.502 0 0 1 1.623 10l1.02-1.02A8.47 8.47 0 0 0 7.4 12.9Z" />
    </svg>
  );
}

type Mode = 'login' | 'register';

export function LoginPanel({
  next,
  googleConfigured,
  devLoginEnabled,
  error,
  admin = false,
}: {
  next: string;
  googleConfigured: boolean;
  devLoginEnabled: boolean;
  error?: string | null;
  admin?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [busy, setBusy] = useState<'google' | 'submit' | 'dev' | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Optional secondary contact on registration (e.g. phone if primary is email, or email if primary is phone)
  const [showSecondary, setShowSecondary] = useState(false);
  const [secondary, setSecondary] = useState('');

  // Dev login state
  const [devEmail, setDevEmail] = useState(admin ? 'admin@example.test' : 'student1@example.test');
  const [devError, setDevError] = useState<string | null>(null);

  const redirectTo = `/auth/continue?next=${encodeURIComponent(next)}`;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy('submit');
    setFormError(null);
    setFormSuccess(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setFormError('Please enter your email or mobile number.');
      setBusy(null);
      return;
    }

    const parsed = parseAuthIdentifier(trimmed);
    if (parsed.type === 'invalid') {
      setFormError(parsed.error);
      setBusy(null);
      return;
    }

    const res = await signIn('email-password', {
      identifier: trimmed,
      email: trimmed,
      password,
      redirect: false,
      redirectTo,
    });

    if (res?.error) {
      setFormError('Invalid credentials. Please check your email or mobile number and password.');
      setBusy(null);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setBusy('submit');
    setFormError(null);
    setFormSuccess(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('Please enter your full name.');
      setBusy(null);
      return;
    }

    const trimmed = identifier.trim();
    if (!trimmed) {
      setFormError('Please enter your email or mobile number.');
      setBusy(null);
      return;
    }

    const parsed = parseAuthIdentifier(trimmed);
    if (parsed.type === 'invalid') {
      setFormError(parsed.error);
      setBusy(null);
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      setBusy(null);
      return;
    }

    let secondaryEmail: string | undefined;
    let secondaryPhone: string | undefined;

    if (showSecondary && secondary.trim()) {
      const secTrimmed = secondary.trim();
      if (parsed.type === 'email') {
        const secCheck = phoneSchema.safeParse(secTrimmed);
        if (!secCheck.success) {
          setFormError('Please enter a valid 10-digit mobile number, or remove the secondary field.');
          setBusy(null);
          return;
        }
        secondaryPhone = secCheck.data;
      } else {
        const secCheck = z.string().email().safeParse(secTrimmed);
        if (!secCheck.success) {
          setFormError('Please enter a valid email address, or remove the secondary field.');
          setBusy(null);
          return;
        }
        secondaryEmail = secTrimmed.toLowerCase();
      }
    }

    try {
      const payload: {
        name: string;
        password: string;
        identifier: string;
        email?: string;
        phone?: string;
      } = {
        name: trimmedName,
        password,
        identifier: trimmed,
      };

      if (parsed.type === 'email') {
        payload.email = parsed.email;
        if (secondaryPhone) payload.phone = secondaryPhone;
      } else {
        payload.phone = parsed.phone;
        if (secondaryEmail) payload.email = secondaryEmail;
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Registration failed. Please try again.');
        setBusy(null);
        return;
      }

      // Auto sign-in after successful registration using the same identifier & password
      const signInRes = await signIn('email-password', {
        identifier: trimmed,
        email: trimmed,
        password,
        redirect: false,
        redirectTo: '/',
      });

      if (signInRes?.error) {
        setFormSuccess('Account created successfully! Please sign in.');
        setMode('login');
        setBusy(null);
        return;
      }

      // Redirect student directly to main course listing page (/)
      router.push('/');
      router.refresh();
    } catch {
      setFormError('Something went wrong. Please try again.');
      setBusy(null);
    }
  }

  async function devLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy('dev');
    setDevError(null);
    const res = await signIn('dev', { email: devEmail, redirect: false, redirectTo });
    if (res?.error) {
      setDevError('Sign-in failed. The account may be suspended.');
      setBusy(null);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  const isEmailInput = identifier.trim().includes('@');

  return (
    <div className="space-y-6">
      {error && (
        <Alert title="Couldn't sign you in">
          {error === 'forbidden'
            ? admin
              ? 'This account does not have admin access.'
              : 'Sign-in failed. Please try again.'
            : error === 'AccessDenied'
              ? 'Access was denied. If this email is already linked to another Google account, contact support.'
              : 'Please try again.'}
        </Alert>
      )}

      {formSuccess && <Alert tone="ok" title="Success">{formSuccess}</Alert>}

      {/* Google sign-in button */}
      <button
        type="button"
        disabled={!googleConfigured || busy !== null}
        onClick={() => {
          setBusy('google');
          signIn('google', { redirectTo });
        }}
        className={cx(
          'flex w-full items-center justify-center gap-3 rounded-xl border-2 px-6 py-3.5 text-sm font-semibold transition-all duration-200',
          'border-line-strong bg-surface text-ink hover:border-brand-200 hover:bg-brand-50/40 hover:shadow-sm',
          'disabled:opacity-50 disabled:pointer-events-none',
          busy === 'google' && 'opacity-70',
        )}
      >
        {busy === 'google' ? (
          <svg className="size-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" /><path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>

      {!googleConfigured && (
        <p className="text-center text-xs text-muted">
          Google sign-in isn&apos;t configured yet. Set <code className="rounded bg-sunken px-1.5 py-0.5 text-xs">GOOGLE_CLIENT_ID</code> and <code className="rounded bg-sunken px-1.5 py-0.5 text-xs">GOOGLE_CLIENT_SECRET</code> in your environment.
        </p>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium text-faint">or continue with email / mobile</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      {/* Mode toggle tabs */}
      <div className="flex rounded-lg bg-sunken p-1">
        <button
          type="button"
          onClick={() => { setMode('login'); setFormError(null); setFormSuccess(null); }}
          className={cx(
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200',
            mode === 'login'
              ? 'bg-surface text-ink shadow-sm'
              : 'text-muted hover:text-ink',
          )}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('register'); setFormError(null); setFormSuccess(null); }}
          className={cx(
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200',
            mode === 'register'
              ? 'bg-surface text-ink shadow-sm'
              : 'text-muted hover:text-ink',
          )}
        >
          Create Account
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={mode === 'login' ? handleLogin : handleRegister}
        className="space-y-4"
      >
        {formError && <Alert>{formError}</Alert>}

        {mode === 'register' && (
          <Field label="Full Name" htmlFor="auth-name" required>
            <Input
              id="auth-name"
              type="text"
              required
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={busy !== null}
            />
          </Field>
        )}

        <Field
          label="Email or Mobile Number"
          htmlFor="auth-identifier"
          required
          hint={mode === 'register' ? 'Use either email (e.g. you@example.com) or 10-digit mobile number' : undefined}
        >
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-faint">
              <ContactIcon value={identifier} />
            </div>
            <Input
              id="auth-identifier"
              type="text"
              required
              placeholder="you@example.com or 10-digit mobile"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              className="pl-10"
              disabled={busy !== null}
            />
          </div>
        </Field>

        {/* Optional secondary contact for registration */}
        {mode === 'register' && (
          <div>
            {!showSecondary ? (
              <button
                type="button"
                onClick={() => setShowSecondary(true)}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                + Also add {isEmailInput ? 'mobile number' : 'email address'} (optional)
              </button>
            ) : (
              <Field
                label={isEmailInput ? 'Mobile Number (Optional)' : 'Email Address (Optional)'}
                htmlFor="auth-secondary"
              >
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-faint">
                    {isEmailInput ? <PhoneIcon /> : <MailIcon />}
                  </div>
                  <Input
                    id="auth-secondary"
                    type={isEmailInput ? 'tel' : 'email'}
                    placeholder={isEmailInput ? '10-digit mobile number' : 'you@example.com'}
                    value={secondary}
                    onChange={(e) => setSecondary(e.target.value)}
                    className="pl-10 pr-16"
                    disabled={busy !== null}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowSecondary(false);
                      setSecondary('');
                    }}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-faint hover:text-muted transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </Field>
            )}
          </div>
        )}

        <Field
          label="Password"
          htmlFor="auth-password"
          required
          hint={mode === 'register' ? 'Must be at least 8 characters' : undefined}
        >
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-faint">
              <LockIcon />
            </div>
            <Input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder={mode === 'register' ? 'Create a strong password' : 'Enter your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              minLength={mode === 'register' ? 8 : undefined}
              className="pl-10 pr-10"
              disabled={busy !== null}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-faint hover:text-muted transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </Field>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={busy === 'submit'}
          disabled={busy !== null}
        >
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </Button>

        {/* Toggle message */}
        <p className="text-center text-sm text-muted">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setFormError(null); setFormSuccess(null); }}
                className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setFormError(null); setFormSuccess(null); }}
                className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </form>

      {/* Trust indicators */}
      <div className="flex items-center justify-center gap-4 text-xs text-faint">
        <span className="flex items-center gap-1.5">
          <LockIcon />
          Secure sign-in
        </span>
        <span className="h-3 w-px bg-line" aria-hidden="true" />
        <span>Encrypted passwords</span>
      </div>

      {/* Dev login */}
      {devLoginEnabled && (
        <>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs font-medium text-faint">Development only</span>
            <div className="h-px flex-1 bg-line" />
          </div>
          <form onSubmit={devLogin} className="space-y-3 rounded-xl border border-dashed border-warn/30 bg-warn-50/40 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-warn">Dev login</div>
            <p className="text-xs text-ink-2">
              Signs in as an existing account, or creates a new student.
            </p>
            <Field label="Email" htmlFor="dev-email" error={devError}>
              <Input id="dev-email" type="email" required value={devEmail} onChange={(e) => setDevEmail(e.target.value)} autoComplete="email" />
            </Field>
            <Button type="submit" size="sm" variant="secondary" loading={busy === 'dev'} disabled={busy !== null}>
              Sign in as dev user
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
