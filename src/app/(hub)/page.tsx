'use client';

import Link from 'next/link';

const NAV_CARDS = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈', desc: 'Net worth, charts, quick stats' },
  { href: '/tracker', label: 'Tracker', icon: '↔', desc: 'Income & expense tracking' },
  { href: '/loans', label: 'Loans', icon: '⟐', desc: 'People, lending, borrowing' },
  { href: '/stats', label: 'Stats', icon: '▣', desc: 'Assets, liabilities, breakdowns' },
  { href: '/settings', label: 'Settings', icon: '⚙', desc: 'Theme, sync, preferences' },
];

export default function HubPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--color-bg)' }}>
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl tracking-wider" style={{ color: 'var(--color-text)' }}>
          Finance
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Personal Ledger
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {NAV_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:-translate-y-0.5"
            style={{
              background: 'var(--color-card)',
              borderColor: 'var(--color-card-border)',
              color: 'var(--color-text)',
            }}
          >
            <span className="text-2xl" style={{ color: 'var(--color-accent)' }}>{card.icon}</span>
            <div>
              <p className="font-medium text-sm">{card.label}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
