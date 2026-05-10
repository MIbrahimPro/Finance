'use client';

import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { computeBurnRate, formatCurrency } from '@/lib/utils';

export default function BurnRateIndicator() {
  const { data: session } = useSession();
  const transactions = useLiveQuery(
    () => db.transactions.where('userId').equals(session?.user?.id ?? '').toArray(),
    [session],
  ) ?? [];

  const burnRate = computeBurnRate(transactions);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthlyIncome = transactions
    .filter((t) => t.type === 'income' && t.timestamp >= monthStart)
    .reduce((s, t) => s + t.amount, 0);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clamped = burnRate < 0 ? 0 : Math.min(burnRate, 100);
  const offset = circumference - (clamped / 100) * circumference;

  const getColor = () => {
    if (burnRate < 0) return 'var(--color-bg-hover)';
    if (burnRate <= 60) return 'var(--color-success)';
    if (burnRate <= 90) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };
  const color = getColor();

  return (
    <div className="rounded-xl border p-5 flex flex-col items-center justify-center h-full" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
      <span className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Burn Rate</span>
      <div className="relative flex items-center justify-center">
        <svg width="130" height="130" className="-rotate-90">
          <circle cx="65" cy="65" r={radius} fill="none" stroke="var(--color-bg-hover)" strokeWidth="8" />
          {burnRate >= 0 && (
            <circle
              cx="65" cy="65" r={radius} fill="none" stroke={color} strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
              className="transition-all duration-700"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {burnRate < 0 ? (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No data</span>
          ) : (
            <>
              <span className="font-display text-2xl" style={{ color }}>{burnRate.toFixed(0)}%</span>
              <span className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>of income</span>
            </>
          )}
        </div>
      </div>
      {monthlyIncome > 0 && burnRate >= 0 && (
        <p className="text-[10px] mt-2 text-center" style={{ color: 'var(--color-text-muted)' }}>
          {burnRate <= 60 ? 'Healthy' : burnRate <= 90 ? 'Caution' : 'Critical'}
        </p>
      )}
    </div>
  );
}
