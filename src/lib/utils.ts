import type { Transaction, Tag, PersonEntry, Person } from './types';

const TAG_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85929E', '#76D7C4',
  '#F0B27A', '#7FB3D8', '#C39BD3', '#73C6B6', '#E59866',
];

export function getRandomTagColor(usedColors: string[]): string {
  const available = TAG_COLORS.filter((c) => !usedColors.includes(c));
  if (available.length === 0) return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
  return available[Math.floor(Math.random() * available.length)];
}

export const DEFAULT_INCOME_TAGS = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
export const DEFAULT_EXPENSE_TAGS = ['Food', 'Transport', 'Rent', 'Utilities', 'Shopping', 'Entertainment', 'Healthcare', 'Other'];

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

export function formatDateShort(ts: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(ts));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function buildDailyExpenseData(transactions: Transaction[], year?: number, month?: number): { day: number; label: string; amount: number }[] {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth();
  const daysInMonth = getDaysInMonth(y, m);
  const monthStart = new Date(y, m, 1).getTime();
  const monthEnd = new Date(y, m + 1, 0, 23, 59, 59, 999).getTime();
  const dailyMap = new Map<number, number>();

  for (let d = 1; d <= daysInMonth; d++) dailyMap.set(d, 0);

  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    if (t.timestamp < monthStart || t.timestamp > monthEnd) continue;
    const day = new Date(t.timestamp).getDate();
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + t.amount);
  }

  return Array.from(dailyMap.entries()).map(([day, amount]) => ({
    day,
    label: String(day),
    amount,
  }));
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function monthName(year: number, month: number): string {
  return new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
}

export function buildCumulativeMonthData(
  transactions: Transaction[],
  year: number,
  month: number,
): { day: number; label: string; value: number }[] {
  const daysInMonth = getDaysInMonth(year, month);
  const monthStart = new Date(year, month, 1).getTime();
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
  const dailyValues = new Array(daysInMonth).fill(0);
  let cumulative = 0;

  for (const t of transactions) {
    if (t.timestamp < monthStart || t.timestamp > monthEnd) continue;
    const day = new Date(t.timestamp).getDate() - 1;
    if (t.type === 'income') dailyValues[day] += t.amount;
    else dailyValues[day] -= t.amount;
  }

  return dailyValues.map((val, i) => {
    cumulative += val;
    return {
      day: i + 1,
      label: String(i + 1),
      value: Math.round(cumulative * 100) / 100,
    };
  });
}

export function buildSixMonthNetWorth(
  transactions: Transaction[],
  persons: Person[],
  personEntries: PersonEntry[],
): { label: string; value: number }[] {
  const now = new Date();
  const months: { label: string; value: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
    const label = d.toLocaleString('default', { month: 'short' });

    const txns = transactions.filter((t) => t.timestamp <= endOfMonth);
    const income = txns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = txns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const entries = personEntries.filter((e) => e.timestamp <= endOfMonth);
    const lent = entries.filter((e) => e.direction === 'lent').reduce((s, e) => s + e.amount, 0);
    const borrowed = entries.filter((e) => e.direction === 'borrowed').reduce((s, e) => s + e.amount, 0);

    months.push({ label, value: income - expenses + lent - borrowed });
  }

  return months;
}

export function computePersonBalance(entries: PersonEntry[]): number {
  const lent = entries.filter((e) => e.direction === 'lent').reduce((s, e) => s + e.amount, 0);
  const borrowed = entries.filter((e) => e.direction === 'borrowed').reduce((s, e) => s + e.amount, 0);
  return lent - borrowed;
}

export function computeMonthIncome(transactions: Transaction[], year: number, month: number): number {
  const monthStart = new Date(year, month, 1).getTime();
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
  return transactions
    .filter((t) => t.type === 'income' && t.timestamp >= monthStart && t.timestamp <= monthEnd)
    .reduce((s, t) => s + t.amount, 0);
}

export function computeMonthExpenses(transactions: Transaction[], year: number, month: number): number {
  const monthStart = new Date(year, month, 1).getTime();
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
  return transactions
    .filter((t) => t.type === 'expense' && t.timestamp >= monthStart && t.timestamp <= monthEnd)
    .reduce((s, t) => s + t.amount, 0);
}

export function totalIncome(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
}

export function totalExpenses(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
}

export function computeNetWorth(transactions: Transaction[], loans: { direction: 'lent' | 'borrowed'; amount: number }[]): number {
  const income = totalIncome(transactions);
  const expenses = totalExpenses(transactions);
  const lent = loans.filter((l) => l.direction === 'lent').reduce((s, l) => s + l.amount, 0);
  const borrowed = loans.filter((l) => l.direction === 'borrowed').reduce((s, l) => s + l.amount, 0);
  return income - expenses + lent - borrowed;
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
