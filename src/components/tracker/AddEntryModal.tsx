'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { db, addToSyncQueue } from '@/lib/db';
import { generateId, formatCurrency } from '@/lib/utils';
import TagSelect from './TagSelect';
import type { Transaction, TransactionType } from '@/lib/types';

interface Props {
  type: TransactionType;
  open: boolean;
  onClose: () => void;
  editTxn?: Transaction | null;
}

export default function AddEntryModal({ type, open, onClose, editTxn }: Props) {
  const { data: session } = useSession();
  const [tagId, setTagId] = useState(editTxn?.tagId ?? '');
  const [title, setTitle] = useState(editTxn?.title ?? '');
  const [amount, setAmount] = useState(editTxn ? String(editTxn.amount) : '');
  const [description, setDescription] = useState(editTxn?.description ?? '');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !tagId || !title || !amount) return;
    setSaving(true);

    const now = Date.now();
    const txn: Transaction = editTxn ?? {
      id: generateId(),
      userId: session.user.id,
      type,
      tagId,
      title: title.trim(),
      amount: parseFloat(amount),
      description: description.trim(),
      timestamp: now,
      updatedAt: now,
    };

    if (editTxn) {
      txn.title = title.trim();
      txn.amount = parseFloat(amount);
      txn.description = description.trim();
      txn.tagId = tagId;
      txn.updatedAt = now;
    }

    if (editTxn) {
      await db.transactions.put(txn);
    } else {
      await db.transactions.add(txn);
    }
    await addToSyncQueue(editTxn ? 'update' : 'create', 'transactions', txn.id, txn, session.user.id);

    setSaving(false);
    setTagId('');
    setTitle('');
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'var(--color-overlay)' }} onClick={onClose}>
      <div
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 border sm:mx-4"
        style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-medium text-sm mb-4" style={{ color: 'var(--color-text)' }}>
          {editTxn ? 'Edit Entry' : type === 'income' ? 'Add Income' : 'Add Expense'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <TagSelect type={type} value={tagId} onChange={setTagId} />

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ background: 'var(--color-input-bg)', color: 'var(--color-text)', borderColor: 'var(--color-input-border)' }}
          />

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-text-muted)' }}>$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full border rounded-lg pl-7 pr-3 py-2.5 text-sm outline-none"
              style={{ background: 'var(--color-input-bg)', color: 'var(--color-text)', borderColor: 'var(--color-input-border)' }}
            />
          </div>

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
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
              style={{ background: type === 'income' ? 'var(--color-success)' : 'var(--color-danger)' }}
            >
              {saving ? 'Saving...' : editTxn ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
