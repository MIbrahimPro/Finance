'use client';

import { db, addToSyncQueue } from '@/lib/db';

interface Props {
  loanId: string;
  userId: string;
}

export default function SettleButton({ loanId, userId }: Props) {
  const handleSettle = async () => {
    const loan = await db.loans.get(loanId);
    if (!loan) return;
    const updated = { ...loan, settled: true, settledAt: Date.now(), updatedAt: Date.now() };
    await db.loans.put(updated);
    await addToSyncQueue('update', 'loans', loanId, updated, userId);
  };

  return (
    <button
      onClick={handleSettle}
      className="text-[10px] px-2 py-0.5 rounded-full border border-success/40 text-success hover:bg-success/10 transition-colors whitespace-nowrap"
    >
      Settle
    </button>
  );
}
