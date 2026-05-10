'use client';

import { useState, useEffect } from 'react';

function getIsOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(getIsOnline);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
