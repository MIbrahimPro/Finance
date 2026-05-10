'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addToSyncQueue } from '@/lib/db';
import { formatCurrency, generateId, formatDateShort } from '@/lib/utils';
import { useStatsLayout } from '@/hooks/useStatsLayout';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { StatsEntry, StatsSection } from '@/lib/types';

const SECTION_META: Record<StatsSection, { label: string; color: string }> = {
  assets: { label: 'Assets', color: 'var(--color-success)' },
  liabilities: { label: 'Liabilities', color: 'var(--color-danger)' },
  income: { label: 'Income', color: 'var(--color-accent)' },
  expenses: { label: 'Expenses', color: 'var(--color-warning)' },
};

function AddStatEntryModal({ section, open, onClose }: { section: StatsSection; open: boolean; onClose: () => void }) {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !title || !amount) return;
    setSaving(true);
    const now = Date.now();
    const entry: StatsEntry = {
      id: generateId(),
      userId: session.user.id,
      section,
      title: title.trim(),
      amount: parseFloat(amount),
      timestamp: now,
      updatedAt: now,
    };
    await db.statsEntries.add(entry);
    await addToSyncQueue('create', 'statsEntries', entry.id, entry, session.user.id);
    setSaving(false);
    setTitle('');
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--color-overlay)' }} onClick={onClose}>
      <div className="w-full max-w-xs mx-4 rounded-xl p-5 border" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }} onClick={(e) => e.stopPropagation()}>
        <h3 className="font-medium text-sm mb-4" style={{ color: 'var(--color-text)' }}>Add to {SECTION_META[section].label}</h3>
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
              style={{ background: SECTION_META[section].color }}>
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatSection({ id, onNetChange }: { id: string; onNetChange: () => void }) {
  const { data: session } = useSession();
  const section = id as StatsSection;
  const [showAdd, setShowAdd] = useState(false);

  const entries = useLiveQuery(
    () => db.statsEntries.where({ userId: session?.user?.id ?? '', section }).reverse().sortBy('timestamp'),
    [session, section],
  ) as StatsEntry[] | undefined;

  const allEntries = entries ?? [];
  const total = allEntries.reduce((s, e) => s + e.amount, 0);
  const meta = SECTION_META[section];

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
      className="rounded-xl border cursor-grab active:cursor-grabbing overflow-hidden"
      style={{
        background: 'var(--color-card)',
        borderColor: 'var(--color-card-border)',
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <span className="text-xs uppercase tracking-wider font-medium" style={{ color: meta.color }}>{meta.label}</span>
        <div className="flex items-center gap-2">
          <span className="font-display text-sm" style={{ color: meta.color }}>{formatCurrency(total)}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setShowAdd(true); }}
            className="text-xs px-2 py-1 rounded text-white"
            style={{ background: meta.color }}
          >+ Add</button>
        </div>
      </div>

      {/* Entry list */}
      <div className="max-h-48 overflow-y-auto">
        {allEntries.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: 'var(--color-text-muted)' }}>No entries. Tap + to add.</p>
        ) : (
          allEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-4 py-2 border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate" style={{ color: 'var(--color-text)' }}>{entry.title}</p>
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{formatDateShort(entry.timestamp)}</p>
              </div>
              <span className="font-display text-sm flex-shrink-0 ml-2" style={{ color: meta.color }}>
                {formatCurrency(entry.amount)}
              </span>
            </div>
          ))
        )}
      </div>

      <AddStatEntryModal section={section} open={showAdd} onClose={() => { setShowAdd(false); }} />
    </div>
  );
}

export default function StatsPage() {
  const { data: session } = useSession();
  const { layout, saveLayout } = useStatsLayout();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const allEntries = useLiveQuery(() => db.statsEntries.where('userId').equals(session?.user?.id ?? '').toArray(), [session]) as StatsEntry[] | undefined;

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

  const positive = (allEntries ?? []).filter((e) => e.section === 'assets' || e.section === 'income').reduce((s, e) => s + e.amount, 0);
  const negative = (allEntries ?? []).filter((e) => e.section === 'liabilities' || e.section === 'expenses').reduce((s, e) => s + e.amount, 0);
  const netWorth = positive - negative;

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      {/* Net worth banner */}
      <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Net Worth</span>
        <p className="font-display text-2xl mt-1" style={{ color: netWorth >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {formatCurrency(netWorth)}
        </p>
        <div className="flex justify-center gap-4 text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
          <span>Pos: <span style={{ color: 'var(--color-success)' }}>{formatCurrency(positive)}</span></span>
          <span>Neg: <span style={{ color: 'var(--color-danger)' }}>{formatCurrency(negative)}</span></span>
        </div>
      </div>

      {/* Draggable sections */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionIds.map((id) => (
              <StatSection key={id} id={id} onNetChange={() => {}} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
