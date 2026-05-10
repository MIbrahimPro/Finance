'use client';

import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatCurrency, totalIncome, totalExpenses, computePersonBalance } from '@/lib/utils';
import { useNetWorth } from '@/hooks/useNetWorth';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import type { Transaction, PersonEntry, Person, StatsEntry } from '@/lib/types';

function NetWorthBanner() {
  const { netWorth, loading } = useNetWorth();
  return (
    <div className="rounded-xl border p-5 text-center" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
      <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Total Net Worth</span>
      <p className={`font-display text-3xl md:text-4xl mt-1 ${loading ? 'opacity-50' : ''}`}
        style={{ color: netWorth >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
        {loading ? '—' : formatCurrency(netWorth)}
      </p>
    </div>
  );
}

function StatsPie({ statsEntries }: { statsEntries: StatsEntry[] }) {
  const sections = ['assets', 'income', 'liabilities', 'expenses'] as const;
  const data = sections.map((s) => ({
    name: s,
    value: statsEntries.filter((e) => e.section === s).reduce((sum, e) => sum + e.amount, 0),
  }));
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  const COLORS = ['var(--color-success)', 'var(--color-accent)', 'var(--color-danger)', 'var(--color-warning)'];
  return (
    <div className="rounded-xl border p-4" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
      <span className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--color-text-muted)' }}>Stats Breakdown</span>
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" paddingAngle={2}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)', fontSize: 12 }}
            formatter={(val: any) => formatCurrency(Number(val))}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-1 text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
            <span className="capitalize">{d.name}: {formatCurrency(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoanSummaryCard() {
  const { data: session } = useSession();
  const persons = useLiveQuery(() => db.persons.where('userId').equals(session?.user?.id ?? '').toArray(), [session]) as Person[] | undefined;
  const entries = useLiveQuery(() => db.personEntries.where('userId').equals(session?.user?.id ?? '').toArray(), [session]) as PersonEntry[] | undefined;
  if (!persons || !entries) return null;
  let lent = 0, borrowed = 0;
  for (const p of persons) {
    const b = computePersonBalance(entries.filter((e) => e.personId === p.id));
    if (b > 0) lent += b; else borrowed += Math.abs(b);
  }
  return (
    <div className="rounded-xl border p-4" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
      <span className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--color-text-muted)' }}>Loans</span>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between"><span style={{ color: 'var(--color-text-muted)' }}>I'm Owed</span><span style={{ color: 'var(--color-success)' }}>{formatCurrency(lent)}</span></div>
        <div className="flex justify-between"><span style={{ color: 'var(--color-text-muted)' }}>I Owe</span><span style={{ color: 'var(--color-danger)' }}>{formatCurrency(borrowed)}</span></div>
        <div className="flex justify-between pt-1 border-t font-display" style={{ borderColor: 'var(--color-border)' }}>
          <span style={{ color: 'var(--color-text)' }}>Net</span>
          <span style={{ color: lent - borrowed >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>{formatCurrency(lent - borrowed)}</span>
        </div>
      </div>
    </div>
  );
}

function TrackerSummary() {
  const { data: session } = useSession();
  const txns = useLiveQuery(() => db.transactions.where('userId').equals(session?.user?.id ?? '').toArray(), [session]) as Transaction[] | undefined;
  if (!txns) return null;
  const inc = totalIncome(txns);
  const exp = totalExpenses(txns);
  return (
    <div className="rounded-xl border p-4" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
      <span className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--color-text-muted)' }}>Tracker</span>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between"><span style={{ color: 'var(--color-text-muted)' }}>Income</span><span style={{ color: 'var(--color-success)' }}>{formatCurrency(inc)}</span></div>
        <div className="flex justify-between"><span style={{ color: 'var(--color-text-muted)' }}>Expenses</span><span style={{ color: 'var(--color-danger)' }}>{formatCurrency(exp)}</span></div>
        <div className="flex justify-between pt-1 border-t font-display" style={{ borderColor: 'var(--color-border)' }}>
          <span style={{ color: 'var(--color-text)' }}>Net</span>
          <span style={{ color: inc - exp >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>{formatCurrency(inc - exp)}</span>
        </div>
      </div>
    </div>
  );
}

function StatsSummary() {
  const { data: session } = useSession();
  const entries = useLiveQuery(() => db.statsEntries.where('userId').equals(session?.user?.id ?? '').toArray(), [session]) as StatsEntry[] | undefined;
  if (!entries) return null;
  const pos = entries.filter((e) => e.section === 'assets' || e.section === 'income').reduce((s, e) => s + e.amount, 0);
  const neg = entries.filter((e) => e.section === 'liabilities' || e.section === 'expenses').reduce((s, e) => s + e.amount, 0);
  return (
    <div className="rounded-xl border p-4" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
      <span className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--color-text-muted)' }}>Stats</span>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between"><span style={{ color: 'var(--color-text-muted)' }}>Assets + Income</span><span style={{ color: 'var(--color-success)' }}>{formatCurrency(pos)}</span></div>
        <div className="flex justify-between"><span style={{ color: 'var(--color-text-muted)' }}>Liabilities + Expenses</span><span style={{ color: 'var(--color-danger)' }}>{formatCurrency(neg)}</span></div>
        <div className="flex justify-between pt-1 border-t font-display" style={{ borderColor: 'var(--color-border)' }}>
          <span style={{ color: 'var(--color-text)' }}>Net</span>
          <span style={{ color: pos - neg >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>{formatCurrency(pos - neg)}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const statsEntries = useLiveQuery(() => db.statsEntries.where('userId').equals(session?.user?.id ?? '').toArray(), [session]) as StatsEntry[] | undefined;

  return (
    <div className="h-full overflow-y-auto space-y-4">
      <NetWorthBanner />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TrackerSummary />
        <LoanSummaryCard />
        <StatsSummary />
      </div>
      {statsEntries && <StatsPie statsEntries={statsEntries} />}
    </div>
  );
}
