'use client';

import { formatCurrency, formatDate } from '@/lib/utils';
import type { Transaction } from '@/lib/types';

const CATEGORY_COLORS: Record<string, string> = {
  salary: 'bg-success/20 text-success',
  freelance: 'bg-accent/20 text-accent',
  investment: 'bg-warning/20 text-warning',
  food: 'bg-danger/20 text-danger',
  transport: 'bg-warning/20 text-warning',
  utilities: 'bg-cream/20 text-cream',
  rent: 'bg-danger/20 text-danger',
  entertainment: 'bg-accent/20 text-accent',
  healthcare: 'bg-success/20 text-success',
  shopping: 'bg-cream/20 text-cream',
  other: 'bg-dark-grey-hover text-cream-muted',
};

const DEFAULT_COLOR = 'bg-dark-grey-hover text-cream-muted';

export default function TransactionRow({ txn }: { txn: Transaction }) {
  const colorClass = CATEGORY_COLORS[txn.category.toLowerCase()] ?? DEFAULT_COLOR;

  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-dark-grey-hover/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colorClass} whitespace-nowrap`}>
          {txn.category}
        </span>
        <span className="text-cream text-sm truncate">{txn.description || txn.category}</span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-cream-muted text-[10px]">{formatDate(txn.timestamp)}</span>
        <span className={`font-display text-sm min-w-[80px] text-right ${
          txn.type === 'income' ? 'text-success' : 'text-danger'
        }`}>
          {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
        </span>
      </div>
    </div>
  );
}
