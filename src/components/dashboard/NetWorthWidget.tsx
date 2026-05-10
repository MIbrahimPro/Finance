'use client';

import { useNetWorth } from '@/hooks/useNetWorth';
import { formatCurrency } from '@/lib/utils';

export default function NetWorthWidget() {
  const { netWorth, loading } = useNetWorth();

  return (
    <div className="rounded-xl border p-5 flex flex-col justify-center h-full" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
      <span className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Net Worth</span>
      <p className={`font-display text-3xl md:text-4xl ${loading ? 'opacity-50' : ''}`} style={{ color: netWorth >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
        {loading ? '—' : formatCurrency(netWorth)}
      </p>
      <span className="text-xs mt-2" style={{ color: netWorth >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
        {netWorth >= 0 ? '▲ Positive' : '▼ Negative'}
      </span>
    </div>
  );
}
