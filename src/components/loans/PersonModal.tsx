'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addToSyncQueue } from '@/lib/db';
import { formatCurrency, formatDateShort, computePersonBalance, generateId } from '@/lib/utils';
import type { Person, PersonEntry, LoanDirection } from '@/lib/types';

interface Props {
  person: Person;
  onClose: () => void;
}

function AddPersonEntryModal({ open, onClose, personId, userId }: { open: boolean; onClose: () => void; personId: string; userId: string }) {
  const [direction, setDirection] = useState<LoanDirection>('lent');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !title.trim()) return;
    setSaving(true);
    const now = Date.now();
    const entry: PersonEntry = {
      id: generateId(),
      userId,
      personId,
      direction,
      amount: parseFloat(amount),
      title: title.trim(),
      timestamp: now,
      updatedAt: now,
    };
    await db.personEntries.add(entry);
    await addToSyncQueue('create', 'personEntries', entry.id, entry, userId);
    setSaving(false);
    setAmount('');
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--color-overlay)' }} onClick={onClose}>
      <div className="w-full max-w-sm mx-4 rounded-xl p-5 border" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }} onClick={(e) => e.stopPropagation()}>
        <h3 className="font-medium text-sm mb-4" style={{ color: 'var(--color-text)' }}>Add Entry</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <button type="button" onClick={() => setDirection('lent')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium ${direction === 'lent' ? 'text-white' : ''}`}
              style={{ background: direction === 'lent' ? 'var(--color-success)' : 'var(--color-input-bg)', color: direction === 'lent' ? 'white' : 'var(--color-text-muted)' }}>
              I Lent
            </button>
            <button type="button" onClick={() => setDirection('borrowed')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium ${direction === 'borrowed' ? 'text-white' : ''}`}
              style={{ background: direction === 'borrowed' ? 'var(--color-danger)' : 'var(--color-input-bg)', color: direction === 'borrowed' ? 'white' : 'var(--color-text-muted)' }}>
              I Borrowed
            </button>
          </div>
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ background: 'var(--color-input-bg)', color: 'var(--color-text)', borderColor: 'var(--color-input-border)' }} />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-text-muted)' }}>$</span>
            <input type="number" step="0.01" min="0" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required
              className="w-full border rounded-lg pl-7 pr-3 py-2.5 text-sm outline-none"
              style={{ background: 'var(--color-input-bg)', color: 'var(--color-text)', borderColor: 'var(--color-input-border)' }} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--color-accent)' }}>
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PersonModal({ person, onClose }: Props) {
  const { data: session } = useSession();
  const [showAdd, setShowAdd] = useState(false);

  const entries = useLiveQuery(
    () => db.personEntries.where({ userId: session?.user?.id ?? '', personId: person.id }).reverse().sortBy('timestamp'),
    [session, person.id],
  ) as PersonEntry[] | undefined;

  const allEntries = entries ?? [];
  const balance = computePersonBalance(allEntries);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'var(--color-overlay)' }}>
      <div
        className="w-full sm:max-w-lg sm:rounded-2xl h-[90vh] sm:h-auto sm:max-h-[80vh] flex flex-col border"
        style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="font-display text-lg" style={{ color: 'var(--color-text)' }}>{person.name}</h2>
            <p className="font-display text-sm mt-0.5" style={{ color: balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
            </p>
          </div>
          <button onClick={onClose} className="text-lg px-2" style={{ color: 'var(--color-text-muted)' }}>✕</button>
        </div>

        {/* Entries */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {allEntries.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>No entries yet.</p>
          )}
          {allEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text)' }}>{entry.title}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatDateShort(entry.timestamp)}</p>
              </div>
              <span
                className="font-display text-sm"
                style={{ color: entry.direction === 'lent' ? 'var(--color-success)' : 'var(--color-danger)' }}
              >
                {entry.direction === 'lent' ? '+' : '-'}{formatCurrency(entry.amount)}
              </span>
            </div>
          ))}
        </div>

        {/* Add button */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setShowAdd(true)}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-white"
            style={{ background: 'var(--color-accent)' }}
          >
            Add Entry
          </button>
        </div>
      </div>

      <AddPersonEntryModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        personId={person.id}
        userId={session?.user?.id ?? ''}
      />
    </div>
  );
}
