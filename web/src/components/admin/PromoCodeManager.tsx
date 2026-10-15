'use client';

import { useState } from 'react';
import type { PromoCode, PromoDiscountType } from '@/types';
import { Card, Button, cx } from '@/components/ui';
import { formatDate } from '@/lib/format';

interface PromoCodeManagerProps {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  initialPromoCodes: PromoCode[];
}

export function PromoCodeManager({
  courseId,
  courseTitle,
  coursePrice,
  initialPromoCodes,
}: PromoCodeManagerProps) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(initialPromoCodes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<PromoDiscountType>('FIXED');
  const [discountValue, setDiscountValue] = useState<string>('50');
  const [maxUses, setMaxUses] = useState<string>('');
  const [perUserLimit, setPerUserLimit] = useState<string>('1');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  // UI status
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  function openCreateModal() {
    setEditingPromo(null);
    setCode('');
    setDiscountType('FIXED');
    setDiscountValue('50');
    setMaxUses('');
    setPerUserLimit('1');
    setExpiresAt('');
    setIsActive(true);
    setError(null);
    setIsModalOpen(true);
  }

  function openEditModal(promo: PromoCode) {
    setEditingPromo(promo);
    setCode(promo.code);
    setDiscountType(promo.discount_type);
    setDiscountValue(promo.discount_value.toString());
    setMaxUses(promo.max_uses !== null ? promo.max_uses.toString() : '');
    setPerUserLimit(promo.per_user_limit.toString());
    setExpiresAt(promo.expires_at ? promo.expires_at.slice(0, 16) : '');
    setIsActive(promo.is_active);
    setError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingPromo(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const numVal = parseFloat(discountValue);
    if (isNaN(numVal) || numVal <= 0) {
      setError('Discount value must be greater than 0');
      setSubmitting(false);
      return;
    }

    if (discountType === 'PERCENTAGE' && numVal > 100) {
      setError('Percentage discount cannot exceed 100%');
      setSubmitting(false);
      return;
    }

    const payload = {
      course_id: courseId,
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: numVal,
      max_uses: maxUses.trim() ? parseInt(maxUses, 10) : null,
      per_user_limit: perUserLimit.trim() ? parseInt(perUserLimit, 10) : 1,
      expires_at: expiresAt.trim() ? new Date(expiresAt).toISOString() : null,
      is_active: isActive,
    };

    try {
      if (editingPromo) {
        const res = await fetch(`/api/admin/promo-codes/${editingPromo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || data.message || 'Failed to update promo code');
        setPromoCodes((prev) => prev.map((p) => (p.id === editingPromo.id ? data.data : p)));
        setSuccessNotice(`Promo code '${payload.code}' updated successfully`);
      } else {
        const res = await fetch('/api/admin/promo-codes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || data.message || 'Failed to create promo code');
        setPromoCodes((prev) => [data.data, ...prev]);
        setSuccessNotice(`Promo code '${payload.code}' created successfully`);
      }
      closeModal();
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(promo: PromoCode) {
    try {
      const res = await fetch(`/api/admin/promo-codes/${promo.id}`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to update status');
      setPromoCodes((prev) => prev.map((p) => (p.id === promo.id ? data.data : p)));
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  }

  async function handleDelete(promo: PromoCode) {
    if (!confirm(`Are you sure you want to delete promo code '${promo.code}'?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/promo-codes/${promo.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to delete');
      }
      setPromoCodes((prev) => prev.filter((p) => p.id !== promo.id));
      setSuccessNotice(`Promo code '${promo.code}' deleted.`);
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete promo code');
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-ink">Course Promo Codes</h2>
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
              {promoCodes.length} {promoCodes.length === 1 ? 'code' : 'codes'}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted">
            Manage multiple discount coupons for this course with usage limits, expiry, and percentage or fixed discounts.
          </p>
        </div>
        <Button onClick={openCreateModal} size="sm" variant="primary">
          + Add Promo Code
        </Button>
      </div>

      {successNotice && (
        <div className="mt-4 rounded-xl bg-ok-50 p-3 text-xs font-medium text-ok ring-1 ring-ok/20">
          {successNotice}
        </div>
      )}

      {promoCodes.length === 0 ? (
        <div className="py-10 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-paper text-muted mb-3 border border-line">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-ink">No promo codes yet</p>
          <p className="mt-1 text-xs text-muted">Create custom coupon codes to offer special discounts to students.</p>
          <Button onClick={openCreateModal} size="sm" variant="secondary" className="mt-4">
            Create First Promo Code
          </Button>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line/80 text-muted font-medium">
                <th className="pb-3 pr-4">Code</th>
                <th className="pb-3 pr-4">Discount</th>
                <th className="pb-3 pr-4">Effective Price</th>
                <th className="pb-3 pr-4">Usage</th>
                <th className="pb-3 pr-4">Validity</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {promoCodes.map((p) => {
                const isPercentage = p.discount_type === 'PERCENTAGE';
                const discountAmount = isPercentage
                  ? Math.round((coursePrice * Number(p.discount_value)) / 100)
                  : Math.min(coursePrice, Number(p.discount_value));
                const finalPrice = Math.max(0, coursePrice - discountAmount);
                const isExpired = p.expires_at && new Date() > new Date(p.expires_at);
                const isExhausted = p.max_uses !== null && p.usage_count >= p.max_uses;

                return (
                  <tr key={p.id} className="hover:bg-paper/40 transition-colors">
                    <td className="py-3 pr-4">
                      <span className="font-mono font-bold text-ink bg-paper px-2 py-1 rounded-md border border-line">
                        {p.code}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-brand-700">
                      {isPercentage ? `${p.discount_value}% OFF` : `₹${p.discount_value} OFF`}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-ink">₹{finalPrice}</span>
                        <span className="line-through text-muted text-[11px]">₹{coursePrice}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-medium text-ink">{p.usage_count}</span>
                      <span className="text-muted"> / {p.max_uses !== null ? p.max_uses : '∞'}</span>
                      {p.per_user_limit > 1 && (
                        <span className="block text-[10px] text-muted">Max {p.per_user_limit}/student</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {p.expires_at ? (
                        <span className={cx(isExpired ? 'text-danger font-medium' : 'text-ink-2')}>
                          {formatDate(p.expires_at)}
                          {isExpired && ' (Expired)'}
                        </span>
                      ) : (
                        <span className="text-muted">Never expires</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() => handleToggle(p)}
                        className={cx(
                          'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-all cursor-pointer',
                          p.is_active && !isExpired && !isExhausted
                            ? 'bg-ok-50 text-ok ring-1 ring-ok/25 hover:bg-ok-100'
                            : 'bg-paper text-muted ring-1 ring-line hover:bg-line/40',
                        )}
                        title="Click to toggle status"
                      >
                        <span
                          className={cx(
                            'size-1.5 rounded-full',
                            p.is_active && !isExpired && !isExhausted ? 'bg-ok' : 'bg-muted',
                          )}
                        />
                        {isExpired ? 'Expired' : isExhausted ? 'Exhausted' : p.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="text-brand-600 hover:text-brand-800 font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="text-danger hover:text-red-700 font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl border border-line">
            <h3 className="font-serif text-lg font-semibold text-ink">
              {editingPromo ? `Edit Promo Code: ${editingPromo.code}` : 'Add Promo Code'}
            </h3>
            <p className="mt-1 text-xs text-muted">
              Configure discount and usage constraints for &quot;{courseTitle}&quot;.
            </p>

            {error && (
              <div className="mt-3 rounded-xl bg-danger-50 p-3 text-xs text-danger ring-1 ring-danger/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. NURSE50"
                  className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm font-mono uppercase text-ink focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as PromoDiscountType)}
                    className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-hidden"
                  >
                    <option value="FIXED">Fixed Amount (₹)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">
                    {discountType === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={discountType === 'PERCENTAGE' ? 100 : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Price Calculation Preview */}
              {discountValue && !isNaN(Number(discountValue)) && (
                <div className="rounded-xl bg-brand-50/60 p-3 border border-brand-100 flex items-center justify-between text-xs">
                  <span className="text-muted">Calculated Final Price:</span>
                  <span className="font-bold text-brand-800 text-sm">
                    ₹
                    {Math.max(
                      0,
                      discountType === 'PERCENTAGE'
                        ? coursePrice - Math.round((coursePrice * Number(discountValue)) / 100)
                        : coursePrice - Number(discountValue),
                    )}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">
                    Max Total Uses <span className="text-muted font-normal">(Blank = ∞)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Per-Student Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={perUserLimit}
                    onChange={(e) => setPerUserLimit(e.target.value)}
                    className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">
                  Expiry Date & Time <span className="text-muted font-normal">(Optional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="size-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="isActive" className="font-medium text-ink cursor-pointer">
                  Activate this promo code immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <Button type="button" variant="secondary" size="sm" onClick={closeModal} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? 'Saving...' : editingPromo ? 'Update Code' : 'Create Code'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
