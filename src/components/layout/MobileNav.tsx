'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Home', icon: '◈' },
  { href: '/tracker', label: 'Track', icon: '↔' },
  { href: '/loans', label: 'Loans', icon: '⟐' },
  { href: '/stats', label: 'Stats', icon: '▣' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 lg:hidden flex border-t"
      style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 flex flex-col items-center py-2 text-[10px] transition-colors"
            style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
          >
            <span className="text-lg leading-none mb-0.5">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
