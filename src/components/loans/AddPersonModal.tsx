'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { db, addToSyncQueue } from '@/lib/db';
import { generateId } from '@/lib/utils';
import type { Person } from '@/lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (person: Person) => void;
}

export default function AddPersonModal({ open, onClose, onCreated }: Props) {
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !name.trim()) return;
    setSaving(true);

    const now = Date.now();
    const person: Person = {
      id: generateId(),
      userId: session.user.id,
      name: name.trim(),
      timestamp: now,
      updatedAt: now,
    };

    await db.persons.add(person);
    await addToSyncQueue('create', 'persons', person.id, person, session.user.id);

    setSaving(false);
    setName('');
    onCreated(person);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--color-overlay)' }} onClick={onClose}>
      <div
        className="w-full max-w-sm mx-4 rounded-xl p-5 border"
        style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-medium text-sm mb-4" style={{ color: 'var(--color-text)' }}>Add Person</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Person's name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ background: 'var(--color-input-bg)', color: 'var(--color-text)', borderColor: 'var(--color-input-border)' }}
          />
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--color-accent)' }}
            >
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
