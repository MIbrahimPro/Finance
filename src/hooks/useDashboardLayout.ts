'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, addToSyncQueue } from '@/lib/db';
import { generateId } from '@/lib/utils';

const DEFAULT_LAYOUT = ['netWorth', 'quickStats', 'netWorthChart', 'burnRate'];

export function useDashboardLayout(userId: string) {
  const layoutRecord = useLiveQuery(
    () => db.dashboardLayout.where('userId').equals(userId).first(),
    [userId],
  );

  const layout = (layoutRecord?.layout as string[]) ?? DEFAULT_LAYOUT;

  const saveLayout = async (newLayout: string[]) => {
    const now = Date.now();
    const id = layoutRecord?.id ?? generateId();
    const record = { id, userId, layout: newLayout, updatedAt: now };
    await db.dashboardLayout.put(record);
    await addToSyncQueue('update', 'dashboardLayout', id, record, userId);
  };

  return { layout, saveLayout };
}
