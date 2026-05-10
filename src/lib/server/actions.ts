'use server';

import { auth } from '@/lib/auth';
import { getDb } from '@/lib/server/db';
import { transactions, tags, persons, personEntries, dashboardLayouts, statsLayouts } from '@/lib/server/schema';
import { eq, and, gt } from 'drizzle-orm';
import type { SyncPayload } from '@/lib/types';

async function getUserIdOrThrow(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

export async function pullRemote(since: number): Promise<SyncPayload> {
  const userId = await getUserIdOrThrow();
  const sinceDate = new Date(since);

  const txns = await getDb().select().from(transactions).where(and(eq(transactions.userId, userId), gt(transactions.updatedAt, sinceDate)));
  const tagRows = await getDb().select().from(tags).where(and(eq(tags.userId, userId), gt(tags.updatedAt, sinceDate)));
  const personRows = await getDb().select().from(persons).where(and(eq(persons.userId, userId), gt(persons.updatedAt, sinceDate)));
  const entryRows = await getDb().select().from(personEntries).where(and(eq(personEntries.userId, userId), gt(personEntries.updatedAt, sinceDate)));
  const layoutRows = await getDb().select().from(dashboardLayouts).where(and(eq(dashboardLayouts.userId, userId), gt(dashboardLayouts.updatedAt, sinceDate)));
  const statsLayoutRows = await getDb().select().from(statsLayouts).where(and(eq(statsLayouts.userId, userId), gt(statsLayouts.updatedAt, sinceDate)));

  return {
    transactions: txns.map((t: any) => ({ ...t, updatedAt: t.updatedAt?.getTime() ?? 0, timestamp: t.timestamp?.getTime() ?? 0 })),
    tags: tagRows.map((t: any) => ({ ...t })),
    persons: personRows.map((p: any) => ({ ...p, timestamp: p.timestamp?.getTime() ?? 0, updatedAt: p.updatedAt?.getTime() ?? 0 })),
    personEntries: entryRows.map((e: any) => ({ ...e, timestamp: e.timestamp?.getTime() ?? 0, updatedAt: e.updatedAt?.getTime() ?? 0 })),
    dashboardLayout: layoutRows.map((l: any) => ({ ...l, updatedAt: l.updatedAt?.getTime() ?? 0 })),
    statsLayout: statsLayoutRows.map((l: any) => ({ ...l, updatedAt: l.updatedAt?.getTime() ?? 0 })),
  } as unknown as SyncPayload;
}

async function upsert(table: any, data: any) {
  const db = getDb();
  await db.insert(table).values(data).onConflictDoUpdate({ target: table.id, set: data });
}

async function del(table: any, id: string, userId: string) {
  await getDb().delete(table).where(and(eq(table.id, id), eq(table.userId, userId)));
}

export async function pushRecord(operation: string, tableName: string, recordData: string) {
  const userId = await getUserIdOrThrow();
  const data = JSON.parse(recordData);

  switch (tableName) {
    case 'transactions':
      if (operation === 'delete') return del(transactions, data.id, userId);
      return upsert(transactions, { ...data, timestamp: new Date(data.timestamp), updatedAt: new Date(data.updatedAt) });
    case 'tags':
      return upsert(tags, data);
    case 'persons':
      return upsert(persons, { ...data, timestamp: new Date(data.timestamp), updatedAt: new Date(data.updatedAt) });
    case 'personEntries':
      return upsert(personEntries, { ...data, timestamp: new Date(data.timestamp), updatedAt: new Date(data.updatedAt) });
    case 'dashboardLayout':
      return upsert(dashboardLayouts, { ...data, updatedAt: new Date(data.updatedAt) });
    case 'statsLayout':
      return upsert(statsLayouts, { ...data, updatedAt: new Date(data.updatedAt) });
    default:
      throw new Error(`Unknown table: ${tableName}`);
  }
}
