'use client';

import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { buildCumulativeMonthData } from '@/lib/utils';
import type { Transaction } from '@/lib/types';

interface Props {
  year: number;
  month: number;
}

export default function MonthChart({ year, month }: Props) {
  const { data: session } = useSession();
  const transactions = useLiveQuery(
    () => db.transactions.where('userId').equals(session?.user?.id ?? '').toArray(),
    [session],
  ) as Transaction[] | undefined;

  if (!transactions) {
    return (
      <div className="rounded-xl border p-4 animate-pulse" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
        <div className="h-48" />
      </div>
    );
  }

  const data = buildCumulativeMonthData(transactions, year, month);
  const finalValue = data.length > 0 ? data[data.length - 1].value : 0;

  return (
    <div className="rounded-xl border p-4" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          Cumulative Position
        </span>
        <span
          className="font-display text-sm"
          style={{ color: finalValue >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
        >
          {finalValue >= 0 ? '+' : ''}{formatCurrency(finalValue)}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }}
            interval={Math.ceil(data.length / 6)}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              color: 'var(--color-text)',
              fontSize: 12,
            }}
            formatter={(value: any) => [formatCurrency(Number(value)), 'Position']}
            labelFormatter={(day) => `Day ${day}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
