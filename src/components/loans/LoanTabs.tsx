'use client';

import { useState } from 'react';

interface Props {
  active: string;
  onChange: (tab: string) => void;
}

export default function LoanTabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-charcoal rounded-lg p-1 border border-dark-grey-hover mb-4">
      <button
        onClick={() => onChange('owed_to_me')}
        className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
          active === 'owed_to_me'
            ? 'bg-dark-grey text-cream'
            : 'text-cream-muted hover:text-cream'
        }`}
      >
        I am Owed
      </button>
      <button
        onClick={() => onChange('i_owe')}
        className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
          active === 'i_owe'
            ? 'bg-dark-grey text-cream'
            : 'text-cream-muted hover:text-cream'
        }`}
      >
        I Owe
      </button>
    </div>
  );
}
