'use client';

import { signOut, useSession } from 'next-auth/react';
import SyncIndicator from './SyncIndicator';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession();

  return (
    <header
      className="h-14 min-h-14 flex items-center justify-between px-4 md:px-6 border-b"
      style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
    >
      <button className="lg:hidden text-lg" onClick={onMenuClick} style={{ color: 'var(--color-text)' }}>
        ☰
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <SyncIndicator />
        {session?.user?.email && (
          <span className="text-xs hidden sm:inline" style={{ color: 'var(--color-text-muted)' }}>
            {session.user.email}
          </span>
        )}
        <button
          onClick={() => signOut()}
          className="text-xs transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
