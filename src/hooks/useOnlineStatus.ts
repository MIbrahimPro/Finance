'use client';

import { useEffect, useState } from 'react';

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setReady(true);
    const go = () => setIsOnline(true);
    const goAway = () => setIsOnline(false);
    window.addEventListener('online', go);
    window.addEventListener('offline', goAway);
    return () => {
      window.removeEventListener('online', go);
      window.removeEventListener('offline', goAway);
    };
  }, []);

  return ready ? isOnline : true;
}
