'use client';

import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { totalIncome, totalExpenses, formatCurrency } from '@/lib/utils';

export default function QuickStats() {
  const { data: session } = useSession();
  const transactions = useLiveQuery(
    () => db.transactions.where('userId').equals(session?.user?.id ?? '').toArray(),
    [session],
  ) ?? [];

  const income = totalIncome(transactions);
  const expenses = totalExpenses(transactions);

  return (
    <div className="rounded-xl border p-5 h-full" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
      <span className="text-xs uppercase tracking-wider mb-3 block" style={{ color: 'var(--color-text-muted)' }}>Quick Stats</span>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Income', value: formatCurrency(income), color: 'var(--color-success)' },
          { label: 'Expenses', value: formatCurrency(expenses), color: 'var(--color-danger)' },
          { label: 'Net', value: formatCurrency(income - expenses), color: income - expenses >= 0 ? 'var(--color-success)' : 'var(--color-danger)' },
          { label: 'Entries', value: String(transactions.length), color: 'var(--color-text-muted)' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg p-3" style={{ background: 'var(--color-bg)' }}>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
            <p className="font-display text-sm mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
