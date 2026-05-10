'use client';

import { useState } from 'react';
import { db, addToSyncQueue } from '@/lib/db';
import { useSession } from 'next-auth/react';
import { formatCurrency, formatDate } from '@/lib/utils';
import AddEntryModal from './AddEntryModal';
import type { Transaction, Tag } from '@/lib/types';

interface Props {
  txn: Transaction;
  tags: Tag[];
}

export default function EntryDetailModal({ txn, tags }: Props) {
  const { data: session } = useSession();
  const [showEdit, setShowEdit] = useState(false);
  const tag = tags.find((t) => t.id === txn.tagId);

  const handleDelete = async () => {
    if (!session?.user?.id) return;
    await db.transactions.delete(txn.id);
    await addToSyncQueue('delete', 'transactions', txn.id, { id: txn.id }, session.user.id);
  };

  return (
    <>
      <div className={`font-display text-lg ${txn.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
      </div>

      <div className="flex items-center gap-2 mt-3">
        {tag && (
          <span className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full" style={{ background: `${tag.color}20`, color: tag.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: tag.color }} />
            {tag.name}
          </span>
        )}
      </div>

      <p className="text-sm mt-3" style={{ color: 'var(--color-text-muted)' }}>
        {txn.description || 'No description'}
      </p>

      <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
        {formatDate(txn.timestamp)}
      </p>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setShowEdit(true)}
          className="flex-1 py-2 rounded-lg text-xs border"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 py-2 rounded-lg text-xs text-white"
          style={{ background: 'var(--color-danger)' }}
        >
          Delete
        </button>
      </div>

      <AddEntryModal
        type={txn.type}
        open={showEdit}
        onClose={() => setShowEdit(false)}
        editTxn={txn}
      />
    </>
  );
}
