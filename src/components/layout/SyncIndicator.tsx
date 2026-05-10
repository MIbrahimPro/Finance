'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export default function SyncIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <span className="flex items-center gap-1.5 text-xs" title={isOnline ? 'Connected' : 'Offline'}>
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{
          background: isOnline ? 'var(--color-success)' : 'var(--color-warning)',
          boxShadow: isOnline ? '0 0 6px rgba(74,222,128,0.5)' : 'none',
        }}
      />
      {isOnline ? 'Cloud' : 'Offline'}
    </span>
  );
}
