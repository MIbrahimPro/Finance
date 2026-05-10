import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';
import RegisterSW from '@/components/layout/RegisterSW';
import SWUpdater from '@/components/layout/SWUpdater';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full" data-theme="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#121212" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon-192x192.svg" />
      </head>
      <body className="h-full overflow-hidden">
        <RegisterSW />
        <SWUpdater />
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
