export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  tagId: string;
  title: string;
  amount: number;
  description: string;
  timestamp: number;
  updatedAt: number;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  type: TransactionType;
}

export type LoanDirection = 'lent' | 'borrowed';

export interface Person {
  id: string;
  userId: string;
  name: string;
  timestamp: number;
  updatedAt: number;
}

export interface PersonEntry {
  id: string;
  userId: string;
  personId: string;
  direction: LoanDirection;
  amount: number;
  title: string;
  timestamp: number;
  updatedAt: number;
}

export interface DashboardLayout {
  id: string;
  userId: string;
  layout: string[];
  updatedAt: number;
}

export interface StatsLayout {
  id: string;
  userId: string;
  layout: string[];
  updatedAt: number;
}

export interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  tableName: string;
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
  tags: Tag[];
  persons: Person[];
  personEntries: PersonEntry[];
  dashboardLayout: DashboardLayout[];
  statsLayout: StatsLayout[];
}

export type WidgetType = 'netWorth' | 'netWorthChart' | 'quickStats' | 'burnRate' | 'dailyExpense';

export interface WidgetConfig {
  id: WidgetType;
  title: string;
}
