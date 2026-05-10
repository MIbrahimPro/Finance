'use client';

import { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import TransactionRow from './TransactionRow';
import type { Transaction } from '@/lib/types';

export default function TransactionList() {
  const { data: session } = useSession();
  const parentRef = useRef<HTMLDivElement>(null);

  const transactions = useLiveQuery(
    () =>
      db.transactions
        .where('userId')
        .equals(session?.user?.id ?? '')
        .reverse()
        .sortBy('timestamp'),
    [session],
  ) as Transaction[] | undefined;

  const allTxns = transactions ?? [];

  const rowVirtualizer = useVirtualizer({
    count: allTxns.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-cream text-sm font-medium">All Transactions</h2>
        <span className="text-cream-muted text-xs">{allTxns.length} entries</span>
      </div>
      <div ref={parentRef} className="flex-1 overflow-y-auto overflow-x-hidden">
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const txn = allTxns[virtualItem.index];
            return (
              <div
                key={txn.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <TransactionRow txn={txn} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
