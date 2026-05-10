'use client';

import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { buildDailyExpenseData, formatCurrency } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Transaction } from '@/lib/types';

export default function DailyExpenseChart() {
  const { data: session } = useSession();
  const transactions = useLiveQuery(
    () => db.transactions.where('userId').equals(session?.user?.id ?? '').toArray(),
    [session],
  ) as Transaction[] | undefined;

  if (!transactions) {
    return (
      <div className="bg-dark-grey rounded-xl border border-dark-grey-hover p-5 h-full animate-pulse" />
    );
  }

  const data = buildDailyExpenseData(transactions);
  const totalMonth = data.reduce((s, d) => s + d.amount, 0);
  const avgDaily = data.length > 0 ? totalMonth / data.filter((d) => d.amount > 0).length : 0;

  return (
    <div className="bg-dark-grey rounded-xl border border-dark-grey-hover p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-cream-muted text-xs uppercase tracking-wider">Daily Spending</span>
        <span className="text-cream-muted text-[10px]">avg ${avgDaily.toFixed(0)}/day</span>
      </div>
      <ResponsiveContainer width="100%" height="75%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#C4C4A8', fontSize: 9 }}
            interval={Math.ceil(data.length / 7) - 1}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#C4C4A8', fontSize: 9 }}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: '#1E1E1E',
              border: '1px solid #2D2D2D',
              borderRadius: 8,
              color: '#F5F5DC',
              fontSize: 12,
            }}
            formatter={(value) => [formatCurrency(Number(value)), 'Spent']}
            labelFormatter={(day) => `Day ${day}`}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#F87171"
            strokeWidth={2}
            dot={{ fill: '#F87171', r: 2 }}
            activeDot={{ r: 4, fill: '#FBBF24' }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-cream-muted text-[10px] text-center mt-1">
        Total this month: <span className="text-danger">{formatCurrency(totalMonth)}</span>
      </p>
    </div>
  );
}