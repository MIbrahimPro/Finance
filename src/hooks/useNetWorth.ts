import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useSession } from 'next-auth/react';
import type { Transaction, PersonEntry, Person } from '@/lib/types';

export function useNetWorth() {
  const { data: session } = useSession();
  const uid = session?.user?.id ?? '';

  const transactions = useLiveQuery(() => db.transactions.where('userId').equals(uid).toArray(), [uid]) as Transaction[] | undefined;
  const personEntries = useLiveQuery(() => db.personEntries.where('userId').equals(uid).toArray(), [uid]) as PersonEntry[] | undefined;

  if (!transactions || !personEntries) {
    return { netWorth: 0, loading: true };
  }

  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const lent = personEntries.filter((e) => e.direction === 'lent').reduce((s, e) => s + e.amount, 0);
  const borrowed = personEntries.filter((e) => e.direction === 'borrowed').reduce((s, e) => s + e.amount, 0);

  return {
    netWorth: income - expenses + lent - borrowed,
    loading: false,
  };
}
