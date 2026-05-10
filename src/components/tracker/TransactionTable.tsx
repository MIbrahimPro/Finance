'use client';

import { useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useVirtualizer } from '@tanstack/react-virtual';
import { formatCurrency, formatDate } from '@/lib/utils';
import EntryDetailModal from './EntryDetailModal';
import type { Transaction, Tag } from '@/lib/types';
import { useState } from 'react';

export default function TransactionTable() {
  const { data: session } = useSession();
  const parentRef = useRef<HTMLDivElement>(null);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const transactions = useLiveQuery(
    () => db.transactions.where('userId').equals(session?.user?.id ?? '').reverse().sortBy('timestamp'),
    [session],
  ) as Transaction[] | undefined;

  const tags = useLiveQuery(
    () => db.tags.where('userId').equals(session?.user?.id ?? '').toArray(),
    [session],
  ) as Tag[] | undefined;

  const allTxns = transactions ?? [];
  const allTags = tags ?? [];

  const rowVirtualizer = useVirtualizer({
    count: allTxns.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  const getTag = (tagId: string) => allTags.find((t) => t.id === tagId);

  return (
    <>
      <div ref={parentRef} className="flex-1 overflow-y-auto">
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const txn = allTxns[virtualItem.index];
            const tag = getTag(txn.tagId);
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
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors hover:opacity-80"
                  onClick={() => setSelectedTxn(txn)}
                >
                  {tag && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tag.color }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: 'var(--color-text)' }}>
                      {txn.title}
                    </p>
                    {txn.description && (
                      <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {txn.description}
                      </p>
                    )}
                  </div>
                  <span
                    className="font-display text-sm flex-shrink-0"
                    style={{ color: txn.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)' }}
                  >
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'var(--color-overlay)' }} onClick={() => setSelectedTxn(null)}>
          <div
            className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 border sm:mx-4"
            style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-medium text-sm mb-4" style={{ color: 'var(--color-text)' }}>{selectedTxn.title}</h3>
            <EntryDetailModal txn={selectedTxn} tags={allTags} />
          </div>
        </div>
      )}
    </>
  );
}
