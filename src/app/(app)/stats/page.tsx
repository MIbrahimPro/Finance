'use client';

import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addToSyncQueue } from '@/lib/db';
import { formatCurrency, generateId } from '@/lib/utils';
import { useStatsLayout } from '@/hooks/useStatsLayout';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import type { Transaction, TransactionType } from '@/lib/types';

function AddStatModal({ type, open, onClose }: { type: string; open: boolean; onClose: () => void }) {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !title || !amount) return;
    setSaving(true);
    const txnType: TransactionType = type === 'income' || type === 'assets' ? 'income' : 'expense';
    const now = Date.now();
    const txn: Transaction = {
      id: generateId(),
      userId: session.user.id,
      type: txnType,
      tagId: '',
      title: title.trim(),
      amount: parseFloat(amount),
      description: '',
      timestamp: now,
      updatedAt: now,
    };
    await db.transactions.add(txn);
    await addToSyncQueue('create', 'transactions', txn.id, txn, session.user.id);
    setSaving(false);
    setTitle('');
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--color-overlay)' }} onClick={onClose}>
      <div className="w-full max-w-xs mx-4 rounded-xl p-5 border" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }} onClick={(e) => e.stopPropagation()}>
        <h3 className="font-medium text-sm mb-4" style={{ color: 'var(--color-text)' }}>Add to {type}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ background: 'var(--color-input-bg)', color: 'var(--color-text)', borderColor: 'var(--color-input-border)' }} />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-text-muted)' }}>$</span>
            <input type="number" step="0.01" min="0" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required
              className="w-full border rounded-lg pl-7 pr-3 py-2.5 text-sm outline-none"
              style={{ background: 'var(--color-input-bg)', color: 'var(--color-text)', borderColor: 'var(--color-input-border)' }} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--color-accent)' }}>
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatSection({ id, label, color }: { id: string; label: string; color: string }) {
  const { data: session } = useSession();
  const [showAdd, setShowAdd] = useState(false);

  const txnType: TransactionType = (id === 'income' || id === 'assets') ? 'income' : 'expense';
  const transactions = useLiveQuery(
    () => db.transactions.where({ userId: session?.user?.id ?? '', type: txnType }).toArray(),
    [session],
  ) as Transaction[] | undefined;

  const total = (transactions ?? []).reduce((s, t) => s + t.amount, 0);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="rounded-xl border p-5 cursor-grab active:cursor-grabbing" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)', transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
        <button
          onClick={(e) => { e.stopPropagation(); setShowAdd(true); }}
          className="text-xs px-2 py-1 rounded text-white"
          style={{ background: color }}
        >
          + Add
        </button>
      </div>
      <p className="font-display text-xl" style={{ color }}>{formatCurrency(total)}</p>
      <AddStatModal type={id} open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

export default function StatsPage() {
  const { data: session } = useSession();
  const { layout, saveLayout } = useStatsLayout();

  const allTxns = useLiveQuery(() => db.transactions.where('userId').equals(session?.user?.id ?? '').toArray(), [session]) as Transaction[] | undefined;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const sections = [
    { id: 'assets', label: 'Assets', color: 'var(--color-success)' },
    { id: 'liabilities', label: 'Liabilities', color: 'var(--color-danger)' },
    { id: 'income', label: 'Income', color: 'var(--color-accent)' },
    { id: 'expenses', label: 'Expenses', color: 'var(--color-warning)' },
  ];

  const sectionIds = layout ?? ['assets', 'liabilities', 'income', 'expenses'];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sectionIds.indexOf(active.id as string);
    const newIdx = sectionIds.indexOf(over.id as string);
    const newOrder = [...sectionIds];
    newOrder.splice(oldIdx, 1);
    newOrder.splice(newIdx, 0, active.id as string);
    saveLayout(newOrder);
  };

  const totalNetWorth = !allTxns ? 0 : (() => {
    const income = allTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = allTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return income - expenses;
  })();

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Net Worth</span>
        <p className="font-display text-2xl mt-1" style={{ color: totalNetWorth >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {formatCurrency(totalNetWorth)}
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sectionIds.map((id) => {
              const section = sections.find((s) => s.id === id);
              if (!section) return null;
              return <StatSection key={id} id={section.id} label={section.label} color={section.color} />;
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
