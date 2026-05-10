'use client';

import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { computeBurnRate, computeMonthlyIncome } from '@/lib/utils';

export default function BurnRateIndicator() {
  const { data: session } = useSession();
  const transactions = useLiveQuery(
    () => db.transactions.where('userId').equals(session?.user?.id ?? '').toArray(),
    [session],
  ) ?? [];

  const burnRate = computeBurnRate(transactions);
  const monthlyIncome = computeMonthlyIncome(transactions);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clamped = burnRate < 0 ? 0 : Math.min(burnRate, 100);
  const offset = circumference - (clamped / 100) * circumference;

  const getColor = () => {
    if (burnRate < 0) return '#2D2D2D';
    if (burnRate <= 60) return '#4ADE80';
    if (burnRate <= 90) return '#FBBF24';
    return '#F87171';
  };

  const color = getColor();

  return (
    <div className="bg-dark-grey rounded-xl border border-dark-grey-hover p-5 flex flex-col items-center justify-center h-full">
      <span className="text-cream-muted text-xs uppercase tracking-wider mb-3">Burn Rate</span>
      <div className="relative flex items-center justify-center">
        <svg width="130" height="130" className="-rotate-90">
          <circle cx="65" cy="65" r={radius} fill="none" stroke="#2D2D2D" strokeWidth="8" />
          {burnRate >= 0 && (
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {burnRate < 0 ? (
            <span className="text-cream-muted text-xs">No data</span>
          ) : (
            <>
              <span className={`font-display text-2xl ${color}`}>
                {burnRate.toFixed(0)}%
              </span>
              <span className="text-cream-muted text-[10px] mt-1">of income</span>
            </>
          )}
        </div>
      </div>
      {monthlyIncome > 0 && burnRate >= 0 && (
        <p className="text-cream-muted text-[10px] mt-2 text-center">
          {burnRate <= 60 ? 'Healthy' : burnRate <= 90 ? 'Caution' : 'Critical'}
        </p>
      )}
    </div>
  );
}
