'use client';

import TransactionList from '@/components/transactions/TransactionList';
import QuickAddForm from '@/components/transactions/QuickAddForm';

export default function TransactionsPage() {
  return (
    <div className="h-full flex flex-col">
      <TransactionList />
      <QuickAddForm />
    </div>
  );
}
