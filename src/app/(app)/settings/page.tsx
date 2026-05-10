'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { useSync } from '@/hooks/useSync';

export default function SettingsPage() {
  const [theme, setTheme] = useState('dark');
  const { syncNow } = useSync();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    db.settings.get('theme').then((s) => {
      if (s?.value) setTheme(s.value);
    });
  }, []);

  const setThemeMode = async (mode: string) => {
    setTheme(mode);
    document.documentElement.setAttribute('data-theme', mode);
    await db.settings.put({ key: 'theme', value: mode });
  };

  const handleSync = async () => {
    setSyncing(true);
    await syncNow();
    setTimeout(() => setSyncing(false), 1000);
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all local data? This cannot be undone.')) return;
    await db.transactions.clear();
    await db.tags.clear();
    await db.persons.clear();
    await db.personEntries.clear();
    await db.dashboardLayout.clear();
    await db.statsLayout.clear();
    await db.syncQueue.clear();
  };

  return (
    <div className="h-full space-y-6 overflow-y-auto">
      <div>
        <h3 className="font-medium text-sm mb-3" style={{ color: 'var(--color-text)' }}>Theme</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setThemeMode('dark')}
            className="flex-1 py-3 rounded-xl border text-sm transition-all"
            style={{
              background: theme === 'dark' ? 'var(--color-accent)' : 'var(--color-card)',
              borderColor: theme === 'dark' ? 'var(--color-accent)' : 'var(--color-card-border)',
              color: theme === 'dark' ? 'white' : 'var(--color-text)',
            }}
          >
            Dark
          </button>
          <button
            onClick={() => setThemeMode('light')}
            className="flex-1 py-3 rounded-xl border text-sm transition-all"
            style={{
              background: theme === 'light' ? '#8B4513' : 'var(--color-card)',
              borderColor: theme === 'light' ? '#8B4513' : 'var(--color-card-border)',
              color: theme === 'light' ? 'white' : 'var(--color-text)',
            }}
          >
            Warm Paper
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-sm mb-3" style={{ color: 'var(--color-text)' }}>Sync</h3>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full py-3 rounded-xl text-sm font-medium text-white disabled:opacity-50"
          style={{ background: 'var(--color-accent)' }}
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      <div>
        <h3 className="font-medium text-sm mb-3" style={{ color: 'var(--color-text)' }}>Data</h3>
        <button
          onClick={handleClear}
          className="w-full py-3 rounded-xl text-sm font-medium text-white"
          style={{ background: 'var(--color-danger)' }}
        >
          Clear All Local Data
        </button>
      </div>

      <p className="text-xs mt-8" style={{ color: 'var(--color-text-muted)' }}>
        Finance v1.0 — Local-First
      </p>
    </div>
  );
}
