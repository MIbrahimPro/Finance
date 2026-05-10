import type { Transaction } from './types';

export function computeNetWorth(transactions: Transaction[], loans: { direction: 'owed_to_me' | 'i_owe'; amount: number; settled: boolean }[]): number {
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

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function buildDailyExpenseData(transactions: Transaction[]): { day: number; amount: number; label: string }[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = getDaysInMonth(year, month);

  const dailyMap = new Map<number, number>();
  const monthStart = new Date(year, month, 1).getTime();
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();

  for (let d = 1; d <= daysInMonth; d++) {
    dailyMap.set(d, 0);
  }

  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    if (t.timestamp < monthStart || t.timestamp > monthEnd) continue;
    const day = new Date(t.timestamp).getDate();
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + t.amount);
  }

  return Array.from(dailyMap.entries()).map(([day, amount]) => ({
    day,
    amount,
    label: new Date(year, month, day).toLocaleString('default', { day: 'numeric' }),
  }));
}

export function buildMonthlyNetWorthData(transactions: Transaction[], loans: { timestamp: number; direction: 'owed_to_me' | 'i_owe'; amount: number; settled: boolean }[]): { label: string; value: number }[] {
  const now = new Date();
  const months: { label: string; value: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
    const label = d.toLocaleString('default', { month: 'short' });

    const txnsUpTo = transactions.filter((t) => t.timestamp <= endOfMonth);
    const loansUpTo = loans.filter((l) => l.timestamp <= endOfMonth);
    const value = computeNetWorth(txnsUpTo, loansUpTo);

    months.push({ label, value });
  }

  return months;
}