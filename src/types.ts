export type Category = string;

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  note: string;
  timestamp: number;
  isRecurring?: boolean;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: number;
}

export interface RecurringExpense {
  id: string;
  amount: number;
  category: Category;
  note: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  customOccurrences?: number;
  customPeriod?: "weekly" | "monthly";
}
