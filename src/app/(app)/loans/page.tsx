'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { db, addToSyncQueue } from '@/lib/db';
import { formatCurrency, generateId } from '@/lib/utils';
import LoanSummary from '@/components/loans/LoanSummary';
import PeopleList from '@/components/loans/PeopleList';
import AddPersonModal from '@/components/loans/AddPersonModal';
import PersonModal from '@/components/loans/PersonModal';
import type { Person } from '@/lib/types';

export default function LoansPage() {
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const { data: session } = useSession();

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      <LoanSummary />

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>People</span>
          <button
            onClick={() => setShowAddPerson(true)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
            style={{ background: 'var(--color-accent)' }}
          >
            + Add Person
          </button>
        </div>
        <PeopleList onSelect={(p) => setSelectedPerson(p)} />
      </div>

      <AddPersonModal open={showAddPerson} onClose={() => setShowAddPerson(false)} onCreated={(p) => { setShowAddPerson(false); setSelectedPerson(p); }} />

      {selectedPerson && (
        <PersonModal person={selectedPerson} onClose={() => setSelectedPerson(null)} />
      )}
    </div>
  );
}
