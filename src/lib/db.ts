import Dexie, { type EntityTable } from 'dexie';
import type { Transaction, Tag, Person, PersonEntry, DashboardLayout, StatsLayout, SyncQueueItem, Setting } from './types';

const db = new Dexie('FinanceDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
  tags: EntityTable<Tag, 'id'>;
  persons: EntityTable<Person, 'id'>;
  personEntries: EntityTable<PersonEntry, 'id'>;
  dashboardLayout: EntityTable<DashboardLayout, 'id'>;
  statsLayout: EntityTable<StatsLayout, 'id'>;
  syncQueue: EntityTable<SyncQueueItem, 'id'>;
  settings: EntityTable<Setting, 'key'>;
};

db.version(2).stores({
  transactions: 'id, userId, type, tagId, timestamp, updatedAt',
  tags: 'id, userId, type, name',
  persons: 'id, userId, name, updatedAt',
  personEntries: 'id, userId, personId, direction, updatedAt',
  dashboardLayout: 'id, userId, updatedAt',
  statsLayout: 'id, userId, updatedAt',
  syncQueue: 'id, userId, synced, timestamp',
  settings: 'key',
});

export { db };

export function addToSyncQueue(
  operation: SyncQueueItem['operation'],
  tableName: string,
  recordId: string,
  recordData: unknown,
  userId: string,
) {
  return db.syncQueue.add({
    id: crypto.randomUUID(),
    operation,
    tableName,
    recordId,
    recordData: JSON.stringify(recordData),
    userId,
    timestamp: Date.now(),
    synced: false,
  });
}
