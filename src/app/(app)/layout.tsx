'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import Header from '@/components/layout/Header';
import PWAPrompt from '@/components/layout/PWAPrompt';
import { useSync } from '@/hooks/useSync';
import { db } from '@/lib/db';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  useSync();

  useEffect(() => {
    if (!session?.user?.id) return;
    db.settings.put({ key: 'userId', value: session.user.id });
  }, [session]);

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* Desktop sidebar only */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden p-4 md:p-6 pb-20 lg:pb-6">
          {children}
        </main>
        {/* Bottom bar — mobile only */}
        <MobileNav />
      </div>
      <PWAPrompt />
    </div>
  );
}
