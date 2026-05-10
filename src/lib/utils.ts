import type { Transaction, Loan } from './types';

export function computeNetWorth(transactions: Transaction[], loans: Loan[]): number {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const receivable = loans
    .filter((l) => l.direction === 'owed_to_me' && !l.settled)
    .reduce((sum, l) => sum + l.amount, 0);
  const payable = loans
    .filter((l) => l.direction === 'i_owe' && !l.settled)
    .reduce((sum, l) => sum + l.amount, 0);
  return income - expenses + receivable - payable;
}

export function computeBurnRate(transactions: Transaction[]): number {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthlyIncome = transactions
    .filter((t) => t.type === 'income' && t.timestamp >= monthStart)
    .reduce((s, t) => s + t.amount, 0);
  const monthlyExpenses = transactions
    .filter((t) => t.type === 'expense' && t.timestamp >= monthStart)
    .reduce((s, t) => s + t.amount, 0);
  if (monthlyIncome === 0) return -1;
  return (monthlyExpenses / monthlyIncome) * 100;
}

export function computeTotalAssets(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
}

export function computeTotalLiabilities(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
}

export function computeMonthlyIncome(transactions: Transaction[]): number {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return transactions
    .filter((t) => t.type === 'income' && t.timestamp >= monthStart)
    .reduce((s, t) => s + t.amount, 0);
}

export function computeMonthlyExpenses(transactions: Transaction[]): number {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return transactions
    .filter((t) => t.type === 'expense' && t.timestamp >= monthStart)
    .reduce((s, t) => s + t.amount, 0);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(ts: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts));
}

export function generateId(): string {
  return crypto.randomUUID();
}
