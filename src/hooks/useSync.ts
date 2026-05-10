'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { db, addToSyncQueue } from '@/lib/db';
import { useOnlineStatus } from './useOnlineStatus';

export function useSync() {
  const { data: session } = useSession();
  const isOnline = useOnlineStatus();
  const lastSyncRef = useRef(0);

  const syncNow = useCallback(async () => {
    if (!session?.user?.id || !isOnline) return;
    lastSyncRef.current = Date.now();

    try {
      const res = await fetch(`/api/sync/pull?since=${lastSyncRef.current}&userId=${session.user.id}`);
      if (!res.ok) return;
      const remote = await res.json();

      for (const table of ['transactions', 'tags', 'persons', 'personEntries', 'dashboardLayout', 'statsLayout'] as const) {
        const records = remote[table] ?? [];
        for (const record of records) {
          const local = await (db as any)[table].get(record.id);
          const remoteTime = new Date(record.updatedAt).getTime();
          if (!local || remoteTime > local.updatedAt) {
            await (db as any)[table].put({ ...record, updatedAt: remoteTime });
          }
        }
      }

      await db.settings.put({ key: 'lastSyncAt', value: String(Date.now()) });
    } catch {
      // retry later
    }
  }, [session, isOnline]);

  const pushPending = useCallback(async () => {
    if (!session?.user?.id || !isOnline) return;

    const pending = await db.syncQueue.where({ userId: session.user.id, synced: false }).toArray();
    if (pending.length === 0) return;

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
        if (res.ok) await db.syncQueue.update(item.id, { synced: true });
      } catch {
        break;
      }
    }
  }, [session, isOnline]);

  useEffect(() => {
    if (!session?.user?.id) return;
    if (isOnline) {
      syncNow();
      pushPending();
    }
    const interval = setInterval(() => {
      if (isOnline) {
        pushPending();
        syncNow();
      }
    }, 30000);
    const handleFocus = () => { if (isOnline) syncNow(); };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && isOnline) syncNow();
    });
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [session, isOnline, syncNow, pushPending]);

  return { syncNow, pushPending };
}

export function queueWrite(
  operation: 'create' | 'update' | 'delete',
  tableName: string,
  recordId: string,
  recordData: unknown,
  userId: string,
) {
  return addToSyncQueue(operation, tableName, recordId, recordData, userId);
}
