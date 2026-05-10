'use client';

import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addToSyncQueue } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import SettlementButton from './SettleButton';

interface Props {
  direction: 'owed_to_me' | 'i_owe';
}

export default function EntityGroup({ direction }: Props) {
  const { data: session } = useSession();
  const loans = useLiveQuery(
    () =>
      db.loans
        .where({ userId: session?.user?.id ?? '', direction })
        .toArray(),
    [session, direction],
  ) ?? [];

  const groups = loans.reduce<Record<string, typeof loans>>((acc, loan) => {
    if (!acc[loan.entityName]) acc[loan.entityName] = [];
    acc[loan.entityName].push(loan);
    return acc;
  }, {});

  if (loans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-cream-muted text-sm">
          {direction === 'owed_to_me' ? 'No one owes you money yet.' : 'You have no outstanding debts.'}
        </p>
        <p className="text-cream-muted text-xs mt-1">
          Use the Quick Add button to record a loan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-y-auto h-[calc(100%-60px)]">
      {Object.entries(groups).map(([entity, entries]) => {
        const total = entries.reduce((s, l) => s + (l.settled ? 0 : l.amount), 0);
        const settledCount = entries.filter((l) => l.settled).length;

        return (
          <div key={entity} className="bg-dark-grey rounded-xl border border-dark-grey-hover p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-cream text-sm font-medium">{entity}</h3>
                <p className="text-cream-muted text-[10px]">
                  {entries.length} record{entries.length !== 1 ? 's' : ''}
                  {settledCount > 0 && ` · ${settledCount} settled`}
                </p>
              </div>
              <span className={`font-display text-lg ${
                direction === 'owed_to_me' ? 'text-success' : 'text-danger'
              }`}>
                {direction === 'owed_to_me' ? '+' : '-'}{formatCurrency(total)}
              </span>
            </div>

            <div className="space-y-1">
              {entries.map((loan) => (
                <div
                  key={loan.id}
                  className={`flex items-center justify-between py-1.5 px-2 rounded-lg ${
                    loan.settled ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      loan.settled ? 'bg-cream-muted' : direction === 'owed_to_me' ? 'bg-success' : 'bg-danger'
                    }`} />
                    <span className="text-cream text-xs truncate">{loan.description || entity}</span>
                    {loan.settled && (
                      <span className="text-cream-muted text-[10px]">✓ Settled</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-display ${
                      direction === 'owed_to_me' ? 'text-success' : 'text-danger'
                    }`}>
                      {formatCurrency(loan.amount)}
                    </span>
                    {!loan.settled && (
                      <SettlementButton loanId={loan.id} userId={session?.user?.id ?? ''} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
