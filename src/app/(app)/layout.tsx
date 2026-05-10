'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
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
    <div className="h-screen flex overflow-hidden bg-charcoal">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
