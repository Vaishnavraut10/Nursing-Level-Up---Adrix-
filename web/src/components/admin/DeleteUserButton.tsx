'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';

export function DeleteUserButton({
  userId,
  userName,
  userEmail,
  redirectTo,
}: {
  userId: string;
  userName: string;
  userEmail: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/admin/users/${userId}`, { method: 'DELETE' });
      setOpen(false);
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        variant="danger"
        size="sm"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        Delete
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 text-left"
          role="dialog"
          aria-modal="true"
          onClick={() => !busy && setOpen(false)}
        >
          <Card className="animate-fade-up w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-ink">Delete this user permanently?</h2>
            <p className="mt-2 text-sm text-muted">
              This account is suspended and will be permanently removed. This action cannot be undone.
            </p>
            <div className="mt-4 rounded-lg border border-line bg-sunken/60 p-3.5 text-xs space-y-1.5">
              <div>
                <span className="font-medium text-muted">Name: </span>
                <span className="font-semibold text-ink">{userName}</span>
              </div>
              <div>
                <span className="font-medium text-muted">Email: </span>
                <span className="font-semibold text-ink">{userEmail}</span>
              </div>
            </div>
            {error && <Alert className="mt-4">{error}</Alert>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={busy}>
                Delete User
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
