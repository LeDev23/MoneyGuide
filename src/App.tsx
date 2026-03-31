/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AllowanceInput } from "./components/AllowanceInput";
import { Dashboard } from "./components/Dashboard";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseList } from "./components/ExpenseList";
import { FeedbackMessage } from "./components/FeedbackMessage";
import { GoalSection } from "./components/GoalSection";
import { RecurringSection } from "./components/RecurringSection";
import { Expense, Goal, RecurringExpense } from "./types";
import { Wallet, RefreshCw, LayoutDashboard, Target, Repeat } from "lucide-react";
import * as db from "./db";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "goals" | "recurring">("overview");

  const [allowance, setAllowance] = useState<number>(0);
  const [allowancePeriod, setAllowancePeriod] = useState<"weekly" | "monthly">("weekly");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await db.initDB();
        setAllowance(await db.getAllowance());
        setAllowancePeriod(await db.getAllowancePeriod());
        setExpenses(await db.getExpenses());
        setGoals(await db.getGoals());
        setRecurringExpenses(await db.getRecurringExpenses());
      } catch (error) {
        console.error("Failed to load local database:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-emerald-600">
          <Wallet size={48} className="animate-pulse" />
          <p className="font-medium text-slate-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const totalRecurring = recurringExpenses.reduce((sum, re) => {
    if (allowancePeriod === "weekly") {
      if (re.frequency === "daily") return sum + (re.amount * 7);
      if (re.frequency === "weekly") return sum + re.amount;
      if (re.frequency === "monthly") return sum + (re.amount / 4);
      if (re.frequency === "custom") {
        if (re.customPeriod === "weekly") return sum + (re.amount * (re.customOccurrences || 1));
        if (re.customPeriod === "monthly") return sum + ((re.amount * (re.customOccurrences || 1)) / 4);
      }
      return sum;
    } else {
      if (re.frequency === "daily") return sum + (re.amount * 30);
      if (re.frequency === "weekly") return sum + (re.amount * 4);
      if (re.frequency === "monthly") return sum + re.amount;
      if (re.frequency === "custom") {
        if (re.customPeriod === "weekly") return sum + (re.amount * (re.customOccurrences || 1) * 4);
        if (re.customPeriod === "monthly") return sum + (re.amount * (re.customOccurrences || 1));
      }
      return sum;
    }
  }, 0);

  const handleSaveAllowance = async (newAllowance: number, period: "weekly" | "monthly") => {
    await db.setAllowanceData(newAllowance, period);
    setAllowance(newAllowance);
    setAllowancePeriod(period);
  };

  const handleSaveExpense = async (expenseData: Omit<Expense, "id" | "timestamp">) => {
    if (editingExpense) {
      const updated = { ...editingExpense, ...expenseData };
      await db.updateExpense(updated);
      setExpenses(expenses.map(e => e.id === editingExpense.id ? updated : e));
      setEditingExpense(null);
    } else {
      const newExpense: Expense = {
        ...expenseData,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      };
      await db.addExpense(newExpense);
      setExpenses([newExpense, ...expenses]);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    await db.deleteExpense(id);
    setExpenses(expenses.filter(e => e.id !== id));
    if (editingExpense?.id === id) {
      setEditingExpense(null);
    }
  };

  const handleAddGoal = async (goalData: Omit<Goal, "id">) => {
    const newGoal: Goal = {
      ...goalData,
      id: crypto.randomUUID()
    };
    await db.addGoal(newGoal);
    setGoals([...goals, newGoal]);
  };

  const handleUpdateGoal = async (id: string, amount: number) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      const updated = { ...goal, currentAmount: goal.currentAmount + amount };
      await db.updateGoal(updated);
      setGoals(goals.map(g => g.id === id ? updated : g));
    }
  };

  const handleDeleteGoal = async (id: string) => {
    await db.deleteGoal(id);
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleAddRecurring = async (reData: Omit<RecurringExpense, "id">) => {
    const newRecurring: RecurringExpense = {
      ...reData,
      id: crypto.randomUUID()
    };
    await db.addRecurringExpense(newRecurring);
    setRecurringExpenses([...recurringExpenses, newRecurring]);
  };

  const handleDeleteRecurring = async (id: string) => {
    await db.deleteRecurringExpense(id);
    setRecurringExpenses(recurringExpenses.filter(re => re.id !== id));
  };

  const handleReset = async () => {
    await db.clearExpenses();
    setExpenses([]);
    setEditingExpense(null);
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600">
            <Wallet size={24} />
            <h1 className="text-xl font-bold tracking-tight">MoneyGuide</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Reset week"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {showResetConfirm && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Reset Week?</h3>
              <p className="text-slate-500 text-sm mb-6">Are you sure you want to delete all expenses for this week? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Dashboard
              allowance={allowance}
              allowancePeriod={allowancePeriod}
              totalSpent={totalSpent}
              expenses={expenses}
              totalRecurring={totalRecurring}
            />
            <FeedbackMessage 
              allowance={allowance} 
              totalSpent={totalSpent} 
              expenses={expenses}
              goals={goals}
              totalRecurring={totalRecurring}
            />

            <AllowanceInput allowance={allowance} allowancePeriod={allowancePeriod} onSave={handleSaveAllowance} />

            <ExpenseForm
              onSave={handleSaveExpense}
              editingExpense={editingExpense}
              onCancelEdit={() => setEditingExpense(null)}
            />

            <ExpenseList
              expenses={expenses}
              onEdit={setEditingExpense}
              onDelete={handleDeleteExpense}
              editingId={editingExpense?.id}
            />
          </div>
        )}

        {activeTab === "goals" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GoalSection 
              goals={goals} 
              onAddGoal={handleAddGoal} 
              onUpdateGoal={handleUpdateGoal} 
              onDeleteGoal={handleDeleteGoal} 
            />
          </div>
        )}

        {activeTab === "recurring" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <RecurringSection 
              recurringExpenses={recurringExpenses} 
              onAdd={handleAddRecurring} 
              onDelete={handleDeleteRecurring} 
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 z-20">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "overview" ? "text-emerald-600" : "text-slate-400"}`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab("goals")}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "goals" ? "text-emerald-600" : "text-slate-400"}`}
          >
            <Target size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Goals</span>
          </button>
          <button
            onClick={() => setActiveTab("recurring")}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "recurring" ? "text-emerald-600" : "text-slate-400"}`}
          >
            <Repeat size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Recurring</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
