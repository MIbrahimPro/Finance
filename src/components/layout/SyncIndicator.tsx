'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export default function SyncIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <span
      className="flex items-center gap-1.5 text-xs"
      title={isOnline ? 'Connected — data syncing' : 'Offline — changes saved locally'}
    >
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          isOnline ? 'bg-success shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 'bg-warning'
        }`}
      />
      {isOnline ? '☁️ Cloud' : '⚡ Offline'}
    </span>
  );
}
