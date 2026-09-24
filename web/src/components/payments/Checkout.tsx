'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, Button, ButtonLink } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';

interface CheckoutOrder {
  purchase: { id: string };
  razorpay: { keyId: string; orderId: string; amount: number; currency: string };
  prefill: { name: string; email: string; contact: string | null };
  course: { id: string; title: string };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed', cb: (res: { error: { description?: string } }) => void): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
    const script = existing ?? document.createElement('script');
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('Could not load Razorpay. Check your connection or disable ad blockers.')));
    if (!existing) {
      script.src = SCRIPT;
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

type Phase = 'idle' | 'creating' | 'paying' | 'verifying' | 'success';

export interface CheckoutProps {
  courseId: string;
  basePrice?: number;
  discountPrice?: number;
  promoCode?: string | null;
  configured: boolean;
  testSeriesId?: string;
  courseTitle?: string;
}

export function Checkout({
  courseId,
  basePrice = 299,
  discountPrice = 199,
  promoCode,
  configured,
  testSeriesId,
  courseTitle = 'Nursing Level Up — Complete Course',
}: CheckoutProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Promo code state
  const targetPromo = promoCode ? promoCode.toUpperCase() : 'NLUP199';
  const discountAmount = Math.max(0, basePrice - (discountPrice ?? 199));
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const isPromoApplied = Boolean(appliedPromo && appliedPromo.toUpperCase() === targetPromo);
  const effectivePrice = isPromoApplied ? (discountPrice ?? 199) : basePrice;

  function handleApplyPromo(e: React.FormEvent) {
    e.preventDefault();
    setPromoError(null);
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (code === targetPromo) {
      setAppliedPromo(targetPromo);
      setPromoInput('');
    } else {
      setPromoError(`Invalid promo code. Use ${targetPromo} for ₹${discountAmount} off.`);
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoError(null);
  }

  async function pay() {
    setError(null);
    setPhase('creating');
    try {
      const [order] = await Promise.all([
        api<CheckoutOrder>('/api/payments/razorpay/order', {
          method: 'POST',
          json: {
            courseId,
            promoCode: appliedPromo || undefined,
          },
        }),
        loadRazorpay(),
      ]);
      setOrderId(order.razorpay.orderId);

      const rzp = new window.Razorpay!({
        key: order.razorpay.keyId,
        order_id: order.razorpay.orderId,
        amount: order.razorpay.amount,
        currency: order.razorpay.currency,
        name: 'Nursing Level Up',
        description: order.course.title,
        prefill: {
          name: order.prefill.name,
          email: order.prefill.email,
          contact: order.prefill.contact ?? undefined,
        },
        notes: {
          course_id: order.course.id,
          promo_code: appliedPromo ?? '',
        },
        theme: { color: '#17655f' },
        handler: async (response: RazorpayResponse) => {
          setPhase('verifying');
          try {
            await api('/api/payments/razorpay/verify', { method: 'POST', json: response });
            setPhase('success');
            router.refresh();
          } catch (err) {
            setPhase('idle');
            setError(`${errorMessage(err)}. If money was deducted, course access will be granted automatically.`);
          }
        },
        modal: {
          ondismiss: () => {
            setPhase((p) => (p === 'paying' ? 'idle' : p));
            api('/api/payments/razorpay/cancel', {
              method: 'POST',
              json: { orderId: order.razorpay.orderId, reason: 'dismissed' },
            }).catch(() => {});
          },
        },
      });

      rzp.on('payment.failed', (res) => {
        setError(res.error?.description ?? 'The payment failed. You can try again.');
      });

      setPhase('paying');
      rzp.open();
    } catch (err) {
      setPhase('idle');
      setError(errorMessage(err));
    }
  }

  if (phase === 'success') {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-ok-50 text-ok ring-1 ring-ok/20">
          <svg className="size-8" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
        </div>
        <Alert tone="ok" title="Course Enrolled — Access Granted!">
          Your course access is now active! Series 1 is available immediately. Further series will release daily at 5:00 PM IST.
        </Alert>
        <div className="flex flex-col gap-2 pt-2">
          {testSeriesId ? (
            <ButtonLink href={`/tests/${testSeriesId}`} size="lg" className="w-full">
              Start Test Now
            </ButtonLink>
          ) : (
            <ButtonLink href="/test-series" size="lg" className="w-full">
              Explore All Test Series
            </ButtonLink>
          )}
          <ButtonLink href="/dashboard" variant="secondary" size="md" className="w-full">
            Go to Dashboard
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!configured && (
        <Alert tone="warn" title="Payments are not available yet">
          Online payments haven’t been configured on this server. Please try again later.
        </Alert>
      )}

      {error && <Alert title="Payment not completed">{error}</Alert>}

      {/* Pricing Summary */}
      <div className="rounded-xl border border-line/80 bg-paper/60 p-4 space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Course Price</span>
          <span className={`font-semibold ${isPromoApplied ? 'line-through text-muted' : 'text-ink'}`}>
            ₹{basePrice}
          </span>
        </div>

        {isPromoApplied && (
          <div className="flex items-center justify-between text-sm text-ok">
            <span className="flex items-center gap-1.5 font-medium">
              <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              Promo Code ({appliedPromo})
            </span>
            <span className="font-semibold">-₹{basePrice - effectivePrice}</span>
          </div>
        )}

        <div className="pt-2 border-t border-line/60 flex items-baseline justify-between">
          <span className="text-base font-semibold text-ink">Total Payable</span>
          <div className="flex items-baseline gap-2">
            {isPromoApplied && (
              <span className="text-sm line-through text-muted">₹{basePrice}</span>
            )}
            <span className="font-serif text-2xl font-bold text-brand-700">
              ₹{effectivePrice}
            </span>
          </div>
        </div>
      </div>

      {/* Promo Code Input */}
      {!isPromoApplied ? (
        <div>
          <form onSubmit={handleApplyPromo} className="flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => {
                setPromoInput(e.target.value);
                setPromoError(null);
              }}
              placeholder={`Enter promo code (${targetPromo})`}
              className="flex-1 rounded-xl border border-line bg-surface px-3.5 py-2 text-sm uppercase placeholder:normal-case placeholder:text-muted focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
            />
            <Button type="submit" variant="secondary" size="md">
              Apply
            </Button>
          </form>
          {promoError && (
            <p className="mt-1.5 text-xs text-rose-600">{promoError}</p>
          )}
          {discountAmount > 0 && (
            <p className="mt-1.5 text-xs text-muted">
              Tip: Use code <strong className="font-semibold text-brand-700">{targetPromo}</strong> for ₹{discountAmount} instant discount!
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl bg-ok-50 px-3.5 py-2 text-xs font-medium text-ok ring-1 ring-inset ring-ok/20">
          <span>Code <strong>{appliedPromo}</strong> applied (-₹{basePrice - effectivePrice})</span>
          <button
            type="button"
            onClick={handleRemovePromo}
            className="text-muted hover:text-ink cursor-pointer underline"
          >
            Remove
          </button>
        </div>
      )}

      {/* Checkout Button */}
      <Button
        size="lg"
        className="w-full"
        onClick={pay}
        disabled={!configured}
        loading={phase === 'creating' || phase === 'verifying' || phase === 'paying'}
      >
        {phase === 'verifying'
          ? 'Verifying payment…'
          : phase === 'paying'
          ? 'Complete payment in Razorpay…'
          : `Pay ₹${effectivePrice} & Enroll in Course`}
      </Button>

      {orderId && <p className="text-center text-xs text-faint">Order ID: {orderId}</p>}

      {testSeriesId && (
        <p className="text-center text-sm">
          <Link href={`/test-series/${testSeriesId}`} className="text-muted hover:text-brand-600">
            ← Back to test details
          </Link>
        </p>
      )}
    </div>
  );
}
