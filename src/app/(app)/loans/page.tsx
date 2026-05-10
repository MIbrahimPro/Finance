'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { db, addToSyncQueue } from '@/lib/db';
import { generateId } from '@/lib/utils';
import LoanTabs from '@/components/loans/LoanTabs';
import EntityGroup from '@/components/loans/EntityGroup';
import type { LoanDirection } from '@/lib/types';

export default function LoansPage() {
  const [tab, setTab] = useState<LoanDirection>('owed_to_me');
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [entityName, setEntityName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !entityName || !amount) return;

    const now = Date.now();
    const loan = {
      id: generateId(),
      userId: session.user.id,
      entityName,
      direction: tab,
      amount: parseFloat(amount),
      description,
      timestamp: now,
      settled: false,
      updatedAt: now,
    };

    await db.loans.add(loan);
    await addToSyncQueue('create', 'loans', loan.id, loan, session.user.id);

    setEntityName('');
    setAmount('');
    setDescription('');
    setShowForm(false);
  };

  return (
    <div className="h-full flex flex-col">
      <LoanTabs active={tab} onChange={(t) => setTab(t as LoanDirection)} />
      <EntityGroup direction={tab} />

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-cream text-charcoal flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity z-10 text-xl"
      >
        +
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-dark-grey rounded-xl border border-dark-grey-hover p-5 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-cream font-medium text-sm mb-4">
              Add {tab === 'owed_to_me' ? 'Receivable' : 'Payable'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Entity name (Person or Bank)"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-charcoal text-cream border border-dark-grey-hover rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cream placeholder:text-cream-muted/50"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
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
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 rounded-lg border border-dark-grey-hover text-cream-muted text-xs hover:text-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-cream text-charcoal text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
