'use client';

import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatCurrency, computePersonBalance } from '@/lib/utils';
import type { Person, PersonEntry } from '@/lib/types';

interface Props {
  onSelect: (person: Person) => void;
}

export default function PeopleList({ onSelect }: Props) {
  const { data: session } = useSession();
  const persons = useLiveQuery(() => db.persons.where('userId').equals(session?.user?.id ?? '').toArray(), [session]) as Person[] | undefined;
  const entries = useLiveQuery(() => db.personEntries.where('userId').equals(session?.user?.id ?? '').toArray(), [session]) as PersonEntry[] | undefined;

  if (!persons || !entries) return null;

  if (persons.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No people added yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {persons.map((person) => {
        const personEntries = entries.filter((e) => e.personId === person.id);
        const balance = computePersonBalance(personEntries);
        return (
          <button
            key={person.id}
            onClick={() => onSelect(person)}
            className="w-full flex items-center justify-between p-4 rounded-xl border text-left transition-colors hover:opacity-80"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{person.name}</span>
            <span
              className="font-display text-sm"
              style={{ color: balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
            >
              {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
