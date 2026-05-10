'use client';

import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { computePersonBalance } from '@/lib/utils';
import type { Person, PersonEntry } from '@/lib/types';

export default function LoanSummary() {
  const { data: session } = useSession();
  const persons = useLiveQuery(() => db.persons.where('userId').equals(session?.user?.id ?? '').toArray(), [session]) as Person[] | undefined;
  const entries = useLiveQuery(() => db.personEntries.where('userId').equals(session?.user?.id ?? '').toArray(), [session]) as PersonEntry[] | undefined;

  if (!persons || !entries) {
    return <div className="flex gap-3 animate-pulse"><div className="flex-1 h-20 rounded-xl" style={{ background: 'var(--color-card)' }} /><div className="flex-1 h-20 rounded-xl" style={{ background: 'var(--color-card)' }} /><div className="flex-1 h-20 rounded-xl" style={{ background: 'var(--color-card)' }} /></div>;
  }

  let totalLent = 0;
  let totalBorrowed = 0;

  for (const person of persons) {
    const personEntries = entries.filter((e) => e.personId === person.id);
    const balance = computePersonBalance(personEntries);
    if (balance > 0) totalLent += balance;
    else totalBorrowed += Math.abs(balance);
  }

  const netPosition = totalLent - totalBorrowed;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-xl border p-4" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>I'm Owed</p>
        <p className="font-display text-lg mt-1" style={{ color: 'var(--color-success)' }}>{formatCurrency(totalLent)}</p>
      </div>
      <div className="rounded-xl border p-4" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>I Owe</p>
        <p className="font-display text-lg mt-1" style={{ color: 'var(--color-danger)' }}>{formatCurrency(totalBorrowed)}</p>
      </div>
      <div className="rounded-xl border p-4" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Net</p>
        <p
          className="font-display text-lg mt-1"
          style={{ color: netPosition >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
        >
          {formatCurrency(netPosition)}
        </p>
      </div>
    </div>
  );
}
