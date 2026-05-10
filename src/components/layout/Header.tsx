'use client';

import { signOut, useSession } from 'next-auth/react';
import SyncIndicator from './SyncIndicator';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="h-14 min-h-14 bg-dark-grey border-b border-dark-grey-hover flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <SyncIndicator />
        {session?.user?.email && (
          <span className="text-cream-muted text-xs">{session.user.email}</span>
        )}
        <button
          onClick={() => signOut()}
          className="text-cream-muted text-xs hover:text-cream transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
