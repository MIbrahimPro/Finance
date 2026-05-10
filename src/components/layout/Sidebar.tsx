'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/tracker', label: 'Tracker', icon: '↔' },
  { href: '/loans', label: 'Loans', icon: '⟐' },
  { href: '/stats', label: 'Stats', icon: '▣' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-60 min-w-60 h-full flex flex-col border-r"
      style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
    >
      <div className="p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h1 className="font-display text-lg tracking-wider" style={{ color: 'var(--color-text)' }}>Finance</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Personal Ledger</p>
      </div>
      <nav className="flex-1 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-5 py-3 text-sm transition-colors"
              style={{
                background: isActive ? 'var(--color-bg-hover)' : 'transparent',
                color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                borderRight: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Finance v1.0</p>
      </div>
    </aside>
  );
}
