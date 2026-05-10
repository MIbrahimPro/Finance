export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  entity?: string;
  timestamp: number;
  updatedAt: number;
}

export type LoanDirection = 'owed_to_me' | 'i_owe';

export interface Loan {
  id: string;
  userId: string;
  entityName: string;
  direction: LoanDirection;
  amount: number;
  description: string;
  timestamp: number;
  settled: boolean;
  settledAt?: number;
  updatedAt: number;
}

export interface DashboardLayout {
  id: string;
  userId: string;
  layout: string[];
  updatedAt: number;
}

export interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  tableName: 'transactions' | 'loans' | 'dashboardLayout';
  recordId: string;
  recordData: string;
  userId: string;
  timestamp: number;
  synced: boolean;
}

export interface Setting {
  key: string;
  value: string;
}

export interface SyncPayload {
  transactions: Transaction[];
  loans: Loan[];
  dashboardLayout: DashboardLayout[];
}

export type WidgetType = 'netWorth' | 'netWorthChart' | 'quickStats' | 'burnRate' | 'dailyExpense';

export interface WidgetConfig {
  id: WidgetType;
  title: string;
}