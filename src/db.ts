import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Expense, Goal, RecurringExpense } from './types';

interface MoneyGuideDB extends DBSchema {
  settings: {
    key: string;
    value: any;
  };
  expenses: {
    key: string;
    value: Expense;
    indexes: { 'by-timestamp': number };
  };
  goals: {
    key: string;
    value: Goal;
  };
  recurringExpenses: {
    key: string;
    value: RecurringExpense;
  };
}

let dbPromise: Promise<IDBPDatabase<MoneyGuideDB>>;

export async function initDB() {
  dbPromise = openDB<MoneyGuideDB>('moneyguide-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
      if (!db.objectStoreNames.contains('expenses')) {
        const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
        expenseStore.createIndex('by-timestamp', 'timestamp');
      }
      if (!db.objectStoreNames.contains('goals')) {
        db.createObjectStore('goals', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('recurringExpenses')) {
        db.createObjectStore('recurringExpenses', { keyPath: 'id' });
      }
    },
  });
  await dbPromise;
}

export async function getAllowance(): Promise<number> {
  const db = await dbPromise;
  return (await db.get('settings', 'allowance')) || 0;
}

export async function getAllowancePeriod(): Promise<"weekly" | "monthly"> {
  const db = await dbPromise;
  return (await db.get('settings', 'allowancePeriod')) || 'weekly';
}

export async function setAllowanceData(allowance: number, period: "weekly" | "monthly") {
  const db = await dbPromise;
  await db.put('settings', allowance, 'allowance');
  await db.put('settings', period, 'allowancePeriod');
}

export async function getExpenses(): Promise<Expense[]> {
  const db = await dbPromise;
  const all = await db.getAllFromIndex('expenses', 'by-timestamp');
  return all.reverse(); // Newest first
}

export async function addExpense(expense: Expense) {
  const db = await dbPromise;
  await db.put('expenses', expense);
}

export async function updateExpense(expense: Expense) {
  const db = await dbPromise;
  await db.put('expenses', expense);
}

export async function deleteExpense(id: string) {
  const db = await dbPromise;
  await db.delete('expenses', id);
}

export async function clearExpenses() {
  const db = await dbPromise;
  await db.clear('expenses');
}

export async function getGoals(): Promise<Goal[]> {
  const db = await dbPromise;
  return await db.getAll('goals');
}

export async function addGoal(goal: Goal) {
  const db = await dbPromise;
  await db.put('goals', goal);
}

export async function updateGoal(goal: Goal) {
  const db = await dbPromise;
  await db.put('goals', goal);
}

export async function deleteGoal(id: string) {
  const db = await dbPromise;
  await db.delete('goals', id);
}

export async function getRecurringExpenses(): Promise<RecurringExpense[]> {
  const db = await dbPromise;
  return await db.getAll('recurringExpenses');
}

export async function addRecurringExpense(expense: RecurringExpense) {
  const db = await dbPromise;
  await db.put('recurringExpenses', expense);
}

export async function deleteRecurringExpense(id: string) {
  const db = await dbPromise;
  await db.delete('recurringExpenses', id);
}
