import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { computeNetWorth } from '@/lib/utils';
import type { Transaction, Loan } from '@/lib/types';

export function useNetWorth(userId: string) {
  const transactions = useLiveQuery(
    () => db.transactions.where('userId').equals(userId).toArray(),
    [userId],
  ) as Transaction[] | undefined;

  const loans = useLiveQuery(
    () => db.loans.where('userId').equals(userId).toArray(),
    [userId],
  ) as Loan[] | undefined;

  if (!transactions || !loans) {
    return { netWorth: 0, transactions: [], loans: [], loading: true };
  }

  return {
    netWorth: computeNetWorth(transactions, loans),
    transactions,
    loans,
    loading: false,
  };
}
