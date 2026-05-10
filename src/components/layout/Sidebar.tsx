'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '◈' },
  { href: '/transactions', label: 'Transactions', icon: '↔' },
  { href: '/loans', label: 'Loans & Debt', icon: '⟐' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-w-56 bg-dark-grey border-r border-dark-grey-hover flex flex-col h-full">
      <div className="p-5 border-b border-dark-grey-hover">
        <h1 className="font-display text-cream text-xl tracking-wider">Finance</h1>
        <p className="text-cream-muted text-xs mt-0.5">Personal Ledger</p>
      </div>
      <nav className="flex-1 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-dark-grey-hover text-cream border-r-2 border-cream'
                  : 'text-cream-muted hover:text-cream hover:bg-dark-grey-hover'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-dark-grey-hover">
        <div className="text-cream-muted text-xs">
          Finance v1.0
        </div>
      </div>
    </aside>
  );
}
