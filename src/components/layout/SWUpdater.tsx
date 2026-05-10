'use client';

import { useEffect, useState } from 'react';

export default function SWUpdater() {
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleUpdate = (reg: ServiceWorkerRegistration) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdate(true);
          }
        });
      });
    };

    navigator.serviceWorker.register('/sw.js').then(handleUpdate).catch(() => {});

    const interval = setInterval(() => {
      navigator.serviceWorker.register('/sw.js').then(handleUpdate);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setUpdate(false);
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
    navigator.serviceWorker.ready.then((reg) => {
      reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
    });
  };

  if (!update) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-50 p-2 flex justify-center">
      <button
        onClick={handleRefresh}
        className="px-4 py-2 rounded-lg text-xs font-medium shadow-lg"
        style={{ background: 'var(--color-accent)', color: 'white' }}
      >
        Update available — tap to refresh
      </button>
    </div>
  );
}
