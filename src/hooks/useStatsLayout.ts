'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, addToSyncQueue } from '@/lib/db';
import { useSession } from 'next-auth/react';
import { generateId } from '@/lib/utils';

const DEFAULT_SECTIONS = ['assets', 'liabilities', 'income', 'expenses'];

export function useStatsLayout() {
  const { data: session } = useSession();
  const uid = session?.user?.id ?? '';

  const layoutRecord = useLiveQuery(() => db.statsLayout.where('userId').equals(uid).first(), [uid]);

  const layout: string[] = layoutRecord?.layout ?? DEFAULT_SECTIONS;

  const saveLayout = async (newLayout: string[]) => {
    const now = Date.now();
    const id = layoutRecord?.id ?? generateId();
    const record = { id, userId: uid, layout: newLayout, updatedAt: now };
    await db.statsLayout.put(record);
    await addToSyncQueue('update', 'statsLayout', id, record, uid);
  };

  return { layout, saveLayout };
}
