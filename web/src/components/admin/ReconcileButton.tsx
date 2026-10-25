'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { api } from '@/lib/api';
import type { ReconcileResult } from '@/lib/server/services/adminService';

export function ReconcileButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReconcileResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  async function handleCheck(dryRun: boolean) {
    setLoading(true);
    try {
      const res = await api<ReconcileResult>('/api/admin/purchases/reconcile', {
        method: 'POST',
        json: { dryRun },
      });
      setResult(res);
      setIsOpen(true);
      if (!dryRun) {
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reconcile transactions');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        disabled={loading}
        onClick={() => handleCheck(true)}
      >
        {loading ? 'Checking...' : 'Reconcile Transactions (Audit)'}
      </Button>

      {isOpen && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-surface p-6 shadow-xl border border-line">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-lg font-semibold text-ink">
                Transaction Reconciliation {result.dryRun ? '(Dry Run Audit)' : '(Executed)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-ink text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto text-sm">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-sunken/50 p-3">
                <div>
                  <span className="text-xs text-muted">Total Checked:</span>
                  <div className="font-semibold text-ink">{result.totalChecked}</div>
                </div>
                <div>
                  <span className="text-xs text-muted">Discrepancies Found:</span>
                  <div className="font-semibold text-ink">{result.candidates.length}</div>
                </div>
              </div>

              {result.candidates.length === 0 ? (
                <div className="rounded-xl bg-ok-50 p-4 text-center text-ok">
                  ✓ All transactions and entitlements are in sync! No missing entitlements found.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="font-medium text-ink">Affected Transactions:</div>
                  {result.candidates.map((c) => (
                    <div
                      key={c.purchaseId}
                      className="rounded-xl border border-line bg-paper p-3 text-xs space-y-1"
                    >
                      <div className="flex justify-between font-medium">
                        <span className="text-ink">{c.userEmail}</span>
                        <span className="font-mono text-muted">{c.orderId}</span>
                      </div>
                      <div className="text-muted">{c.issue}</div>
                      <div className="text-brand-700 font-semibold">{c.action}</div>
                    </div>
                  ))}
                </div>
              )}

              {result.unassignedTests.length > 0 && (
                <div className="rounded-xl bg-warn-50 p-3 text-xs text-warn">
                  <strong>Notice:</strong> {result.unassignedTests.length} published test series have no course assigned:
                  <ul className="list-disc pl-4 mt-1">
                    {result.unassignedTests.map((t) => (
                      <li key={t.id}>{t.title}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-line pt-4">
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              {result.dryRun && result.candidates.length > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleCheck(false)}
                >
                  Apply {result.candidates.length} Repairs
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
