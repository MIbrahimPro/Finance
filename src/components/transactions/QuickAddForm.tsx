'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { db, addToSyncQueue } from '@/lib/db';
import { generateId } from '@/lib/utils';
import type { TransactionType } from '@/lib/types';

const CATEGORIES = [
  'Salary', 'Freelance', 'Investment',
  'Food', 'Transport', 'Utilities', 'Rent',
  'Entertainment', 'Healthcare', 'Shopping', 'Other',
];

export default function QuickAddForm() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('Other');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !amount) return;

    const now = Date.now();
    const txn = {
      id: generateId(),
      userId: session.user.id,
      type,
      category,
      amount: parseFloat(amount),
      description,
      timestamp: now,
      updatedAt: now,
    };

    await db.transactions.add(txn);
    await addToSyncQueue('create', 'transactions', txn.id, txn, session.user.id);

    setAmount('');
    setDescription('');
    setCategory('Other');
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-cream text-charcoal flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity z-10 text-xl"
      >
        +
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
          <div className="bg-dark-grey rounded-xl border border-dark-grey-hover p-5 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-cream font-medium text-sm mb-4">Quick Add</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                    type === 'expense'
                      ? 'bg-danger/20 text-danger border border-danger/40'
                      : 'bg-charcoal text-cream-muted border border-dark-grey-hover'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                    type === 'income'
                      ? 'bg-success/20 text-success border border-success/40'
                      : 'bg-charcoal text-cream-muted border border-dark-grey-hover'
                  }`}
                >
                  Income
                </button>
              </div>

              <div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-charcoal text-cream border border-dark-grey-hover rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cream"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-charcoal text-cream border border-dark-grey-hover rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cream placeholder:text-cream-muted/50"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-charcoal text-cream border border-dark-grey-hover rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cream placeholder:text-cream-muted/50"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-dark-grey-hover text-cream-muted text-xs hover:text-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-cream text-charcoal text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
