'use client';

import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { computeNetWorth } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Transaction, Loan } from '@/lib/types';

function buildSixMonthNetWorth(transactions: Transaction[], loans: Loan[]) {
  const now = new Date();
  const months: { label: string; value: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getTime();
    const label = d.toLocaleString('default', { month: 'short' });

    const txnsUpTo = transactions.filter((t) => t.timestamp <= endOfMonth);
    const loansUpTo = loans.filter((l) => l.timestamp <= endOfMonth);
    const value = computeNetWorth(txnsUpTo, loansUpTo);

    months.push({ label, value });
  }

  return months;
}

export default function NetWorthChart() {
  const { data: session } = useSession();
  const transactions = useLiveQuery(
    () => db.transactions.where('userId').equals(session?.user?.id ?? '').toArray(),
    [session],
  ) as Transaction[] | undefined;
  const loans = useLiveQuery(
    () => db.loans.where('userId').equals(session?.user?.id ?? '').toArray(),
    [session],
  ) as Loan[] | undefined;

  if (!transactions || !loans) {
    return (
      <div className="bg-dark-grey rounded-xl border border-dark-grey-hover p-5 h-full animate-pulse" />
    );
  }

  const data = buildSixMonthNetWorth(transactions, loans);

  return (
    <div className="bg-dark-grey rounded-xl border border-dark-grey-hover p-5 h-full">
      <span className="text-cream-muted text-xs uppercase tracking-wider mb-3 block">Net Worth (6mo)</span>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818CF8" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#818CF8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#C4C4A8', fontSize: 10 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#C4C4A8', fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: '#1E1E1E', border: '1px solid #2D2D2D', borderRadius: 8, color: '#F5F5DC', fontSize: 12 }}
            formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Net Worth']}
          />
          <Area type="monotone" dataKey="value" stroke="#818CF8" strokeWidth={2} fill="url(#netWorthGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
