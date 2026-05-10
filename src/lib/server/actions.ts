'use server';

import { auth } from '@/lib/auth';
import { getDb } from '@/lib/server/db';
import { transactions, loans, dashboardLayouts } from '@/lib/server/schema';
import { eq, and, gt } from 'drizzle-orm';
import type { SyncPayload } from '@/lib/types';
import type { Session } from 'next-auth';

async function getUserIdOrThrow(): Promise<string> {
  const session: Session | null = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

export async function pullChanges(since: number): Promise<SyncPayload> {
  const userId = await getUserIdOrThrow();

  const sinceDate = new Date(since);

  const txns = await getDb()
    .select()
    .from(transactions)
    .where(and(eq(transactions.userId, userId), gt(transactions.updatedAt, sinceDate)));

  const loanRecords = await getDb()
    .select()
    .from(loans)

  const layouts = await getDb()
    .select()
    .from(dashboardLayouts)
    .where(and(eq(dashboardLayouts.userId, userId), gt(dashboardLayouts.updatedAt, sinceDate)));

  return {
    transactions: txns.map((t) => ({ ...t, updatedAt: t.updatedAt!.getTime(), timestamp: t.timestamp!.getTime() })),
    loans: loanRecords.map((l) => ({ ...l, updatedAt: l.updatedAt!.getTime(), timestamp: l.timestamp!.getTime(), settledAt: l.settledAt?.getTime() })),
    dashboardLayout: layouts.map((d) => ({ ...d, updatedAt: d.updatedAt!.getTime() })),
  } as unknown as SyncPayload;
}

export async function pushTransaction(data: {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  entity?: string;
  timestamp: number;
  updatedAt: number;
}) {
  const userId = await getUserIdOrThrow();

  await getDb()
    .insert(transactions)
    .values({ ...data, userId, timestamp: new Date(data.timestamp), updatedAt: new Date(data.updatedAt) })
    .onConflictDoUpdate({
      target: transactions.id,
      set: { ...data, userId, timestamp: new Date(data.timestamp), updatedAt: new Date(data.updatedAt) },
    });
}

export async function deleteTransaction(id: string) {
  const userId = await getUserIdOrThrow();

  await getDb().delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

export async function pushLoan(data: {
  id: string;
  entityName: string;
  direction: 'owed_to_me' | 'i_owe';
  amount: number;
  description?: string;
  timestamp: number;
  settled: boolean;
  settledAt?: number;
  updatedAt: number;
}) {
  const userId = await getUserIdOrThrow();

  await getDb()
    .insert(loans)
    .values({
      ...data,
      userId,
      timestamp: new Date(data.timestamp),
      settledAt: data.settledAt ? new Date(data.settledAt) : null,
      updatedAt: new Date(data.updatedAt),
    })
    .onConflictDoUpdate({
      target: loans.id,
      set: {
        ...data,
        userId,
        timestamp: new Date(data.timestamp),
        settledAt: data.settledAt ? new Date(data.settledAt) : null,
        updatedAt: new Date(data.updatedAt),
      },
    });
}

export async function deleteLoan(id: string) {
  const userId = await getUserIdOrThrow();

  await getDb().delete(loans).where(and(eq(loans.id, id), eq(loans.userId, userId)));
}

export async function pushDashboardLayout(data: {
  id: string;
  layout: string[];
  updatedAt: number;
}) {
  const userId = await getUserIdOrThrow();

  await getDb()
    .insert(dashboardLayouts)
    .values({ ...data, userId, updatedAt: new Date(data.updatedAt) })
    .onConflictDoUpdate({
      target: dashboardLayouts.id,
      set: { ...data, userId, updatedAt: new Date(data.updatedAt) },
    });
}
