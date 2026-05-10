'use client';

import { useNetWorth } from '@/hooks/useNetWorth';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/lib/utils';

export default function NetWorthWidget() {
  const { data: session } = useSession();
  const { netWorth, loading } = useNetWorth(session?.user?.id ?? '');

  return (
    <div className="bg-dark-grey rounded-xl border border-dark-grey-hover p-5 flex flex-col justify-center h-full">
      <span className="text-cream-muted text-xs uppercase tracking-wider mb-1">Net Worth</span>
      <p className={`font-display text-4xl text-cream ${loading ? 'animate-pulse opacity-50' : ''}`}>
        {loading ? '—' : formatCurrency(netWorth)}
      </p>
      <span className={`text-xs mt-2 ${netWorth >= 0 ? 'text-success' : 'text-danger'}`}>
        {netWorth >= 0 ? '▲ Positive' : '▼ Negative'}
      </span>
    </div>
  );
}
