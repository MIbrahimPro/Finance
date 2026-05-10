'use client';

import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatCurrency, buildSixMonthNetWorth } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import type { Transaction, Person, PersonEntry } from '@/lib/types';
import { useNetWorth } from '@/hooks/useNetWorth';

function NetWorthCard() {
  const { netWorth, loading } = useNetWorth();
  return (
    <div className="rounded-xl border p-5 flex flex-col justify-center" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
      <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Net Worth</span>
      <p
        className={`font-display text-3xl md:text-4xl mt-1 ${loading ? 'opacity-50' : ''}`}
        style={{ color: netWorth >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
      >
        {loading ? '—' : formatCurrency(netWorth)}
      </p>
    </div>
  );
}

function SixMonthChart() {
  const { data: session } = useSession();
  const transactions = useLiveQuery(() => db.transactions.where('userId').equals(session?.user?.id ?? '').toArray(), [session]) as Transaction[] | undefined;
  const persons = useLiveQuery(() => db.persons.where('userId').equals(session?.user?.id ?? '').toArray(), [session]) as Person[] | undefined;
  const personEntries = useLiveQuery(() => db.personEntries.where('userId').equals(session?.user?.id ?? '').toArray(), [session]) as PersonEntry[] | undefined;

  if (!transactions || !persons || !personEntries) {
    return <div className="rounded-xl border p-5 animate-pulse" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }} />;
  }

  const data = buildSixMonthNetWorth(transactions, persons, personEntries);

  return (
    <div className="rounded-xl border p-5" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
      <span className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--color-text-muted)' }}>Net Worth (6mo)</span>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} tickFormatter={(v: any) => `$${(Number(v) / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)', fontSize: 12 }} formatter={(val: any) => [formatCurrency(Number(val)), 'Net Worth']} />
          <Area type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={2} fill="url(#nwGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="h-full overflow-y-auto space-y-4">
      <NetWorthCard />
      <SixMonthChart />
    </div>
  );
}
