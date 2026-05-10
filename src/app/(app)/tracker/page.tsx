'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { monthName, formatCurrency, computeMonthIncome, computeMonthExpenses } from '@/lib/utils';
import MonthChart from '@/components/tracker/MonthChart';
import TransactionTable from '@/components/tracker/TransactionTable';
import AddEntryModal from '@/components/tracker/AddEntryModal';
import type { Transaction } from '@/lib/types';

export default function TrackerPage() {
  const now = new Date();
  const { data: session } = useSession();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [showIncome, setShowIncome] = useState(false);
  const [showExpense, setShowExpense] = useState(false);

  const transactions = useLiveQuery(
    () => db.transactions.where('userId').equals(session?.user?.id ?? '').toArray(),
    [session],
  ) as Transaction[] | undefined;

  const allTxns = transactions ?? [];

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Month selector + summary */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="text-sm px-2 py-1 rounded-lg" style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text)' }}>◀</button>
        <span className="font-display text-sm" style={{ color: 'var(--color-text)' }}>{monthName(year, month)}</span>
        <button onClick={nextMonth} disabled={isCurrentMonth} className="text-sm px-2 py-1 rounded-lg disabled:opacity-30" style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text)' }}>▶</button>
      </div>

      {/* Chart */}
      <MonthChart year={year} month={month} />

      {/* Quick stats */}
      <div className="flex gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <span>Income: <span style={{ color: 'var(--color-success)' }}>{formatCurrency(computeMonthIncome(allTxns, year, month))}</span></span>
        <span>Expenses: <span style={{ color: 'var(--color-danger)' }}>{formatCurrency(computeMonthExpenses(allTxns, year, month))}</span></span>
      </div>

      {/* Transaction list */}
      <div className="flex-1 flex flex-col min-h-0">
        <span className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Entries</span>
        <TransactionTable />
      </div>

      {/* FAB buttons */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 flex gap-3 z-10">
        <button
          onClick={() => setShowIncome(true)}
          className="w-12 h-12 rounded-full text-white text-lg flex items-center justify-center shadow-lg"
          style={{ background: 'var(--color-success)' }}
        >
          +
        </button>
        <button
          onClick={() => setShowExpense(true)}
          className="w-12 h-12 rounded-full text-white text-lg flex items-center justify-center shadow-lg"
          style={{ background: 'var(--color-danger)' }}
        >
          −
        </button>
      </div>

      <AddEntryModal type="income" open={showIncome} onClose={() => setShowIncome(false)} />
      <AddEntryModal type="expense" open={showExpense} onClose={() => setShowExpense(false)} />
    </div>
  );
}
