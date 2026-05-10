'use client';

import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { db, addToSyncQueue } from '@/lib/db';
import { useOnlineStatus } from './useOnlineStatus';

export function useSync() {
  const { data: session } = useSession();
  const isOnline = useOnlineStatus();

  const syncNow = useCallback(async () => {
    if (!session?.user?.id || !isOnline) return;

    const lastSync = await db.settings.get('lastSyncAt');
    const lastSyncVal = lastSync?.value ? parseInt(lastSync.value, 10) : 0;

    try {
      const res = await fetch(
        `/api/sync/pull?since=${lastSyncVal}&userId=${session.user.id}`,
      );
      if (!res.ok) return;
      const remote = await res.json();

      for (const table of ['transactions', 'loans', 'dashboardLayout'] as const) {
        const records = remote[table] ?? [];
        for (const record of records) {
          const local = await db[table].get(record.id);
          const remoteTime = new Date(record.updatedAt).getTime();
          if (!local || remoteTime > local.updatedAt) {
            await db[table].put({ ...record, updatedAt: remoteTime });
          }
        }
      }

      await db.settings.put({ key: 'lastSyncAt', value: String(Date.now()) });
    } catch {
      // Silently fail — will retry on next interval
    }
  }, [session, isOnline]);

  const pushPending = useCallback(async () => {
    if (!session?.user?.id || !isOnline) return;

    const pending = await db.syncQueue
      .where({ userId: session.user.id, synced: false })
      .toArray();

    for (const item of pending) {
      try {
        const res = await fetch('/api/sync/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: item.operation,
            tableName: item.tableName,
            recordId: item.recordId,
            recordData: item.recordData,
          }),
        });
        if (res.ok) {
          await db.syncQueue.update(item.id, { synced: true });
        }
      } catch {
        break;
      }
    }
  }, [session, isOnline]);

  useEffect(() => {
    if (!isOnline || !session?.user?.id) return;
    syncNow();
    const interval = setInterval(() => {
      pushPending();
      syncNow();
    }, 30000);
    return () => clearInterval(interval);
  }, [isOnline, session, syncNow, pushPending]);

  return { syncNow, pushPending };
}

export async function onLocalWrite(
  operation: 'create' | 'update' | 'delete',
  tableName: 'transactions' | 'loans' | 'dashboardLayout',
  recordId: string,
  recordData: unknown,
  userId: string,
) {
  await addToSyncQueue(operation, tableName, recordId, recordData, userId);
}
