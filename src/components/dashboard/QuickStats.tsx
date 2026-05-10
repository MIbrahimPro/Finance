'use client';

import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { computeTotalAssets, computeTotalLiabilities, computeMonthlyIncome, computeMonthlyExpenses, formatCurrency } from '@/lib/utils';

export default function QuickStats() {
  const { data: session } = useSession();
  const transactions = useLiveQuery(
    () => db.transactions.where('userId').equals(session?.user?.id ?? '').toArray(),
    [session],
  ) ?? [];

  const stats = [
    { label: 'Total Assets', value: formatCurrency(computeTotalAssets(transactions)), color: 'text-success' },
    { label: 'Liabilities', value: formatCurrency(computeTotalLiabilities(transactions)), color: 'text-danger' },
    { label: 'Monthly Income', value: formatCurrency(computeMonthlyIncome(transactions)), color: 'text-success' },
    { label: 'Expenses', value: formatCurrency(computeMonthlyExpenses(transactions)), color: 'text-danger' },
  ];

  return (
    <div className="bg-dark-grey rounded-xl border border-dark-grey-hover p-5 h-full">
      <span className="text-cream-muted text-xs uppercase tracking-wider mb-3 block">Quick Stats</span>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-charcoal/50 rounded-lg p-3">
            <p className="text-cream-muted text-[10px] uppercase tracking-wider">{s.label}</p>
            <p className={`font-display text-sm mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
