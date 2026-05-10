import Dexie, { type EntityTable } from 'dexie';
import type { Transaction, Loan, DashboardLayout, SyncQueueItem, Setting } from './types';

const db = new Dexie('FinanceDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
  loans: EntityTable<Loan, 'id'>;
  dashboardLayout: EntityTable<DashboardLayout, 'id'>;
  syncQueue: EntityTable<SyncQueueItem, 'id'>;
  settings: EntityTable<Setting, 'key'>;
};

db.version(1).stores({
  transactions: 'id, userId, type, category, timestamp, updatedAt',
  loans: 'id, userId, entityName, direction, settled, updatedAt',
  dashboardLayout: 'id, userId, updatedAt',
  syncQueue: 'id, userId, synced, timestamp',
  settings: 'key',
});

export { db };

export function addToSyncQueue(
  operation: SyncQueueItem['operation'],
  tableName: SyncQueueItem['tableName'],
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
