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

export default function App() {
  const [activeTab, setActiveTab] = useState<"overview" | "goals" | "recurring">("overview");

  const [allowance, setAllowance] = useState<number>(() => {
    const saved = localStorage.getItem("moneyGuide_allowance");
    return saved ? parseFloat(saved) : 0;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem("moneyGuide_expenses");
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("moneyGuide_goals");
    return saved ? JSON.parse(saved) : [];
  });

  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() => {
    const saved = localStorage.getItem("moneyGuide_recurring");
    return saved ? JSON.parse(saved) : [];
  });

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    localStorage.setItem("moneyGuide_allowance", allowance.toString());
  }, [allowance]);

  useEffect(() => {
    localStorage.setItem("moneyGuide_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("moneyGuide_goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("moneyGuide_recurring", JSON.stringify(recurringExpenses));
  }, [recurringExpenses]);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const totalRecurringWeekly = recurringExpenses.reduce((sum, re) => {
    return sum + (re.frequency === "weekly" ? re.amount : re.amount / 4);
  }, 0);

  const handleSaveExpense = (expenseData: Omit<Expense, "id" | "timestamp">) => {
    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((exp) =>
          exp.id === editingExpense.id ? { ...exp, ...expenseData } : exp,
        ),
      );
      setEditingExpense(null);
    } else {
      const newExpense: Expense = {
        ...expenseData,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      setExpenses((prev) => [newExpense, ...prev]);
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    if (editingExpense?.id === id) {
      setEditingExpense(null);
    }
  };

  const handleAddGoal = (goalData: Omit<Goal, "id">) => {
    const newGoal: Goal = { ...goalData, id: crypto.randomUUID() };
    setGoals(prev => [...prev, newGoal]);
  };

  const handleUpdateGoal = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleAddRecurring = (reData: Omit<RecurringExpense, "id">) => {
    const newRE: RecurringExpense = { ...reData, id: crypto.randomUUID() };
    setRecurringExpenses(prev => [...prev, newRE]);
  };

  const handleDeleteRecurring = (id: string) => {
    setRecurringExpenses(prev => prev.filter(re => re.id !== id));
  };

  const handleReset = () => {
    setExpenses([]);
    setEditingExpense(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600">
            <Wallet size={24} />
            <h1 className="text-xl font-bold tracking-tight">MoneyGuide</h1>
          </div>
          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Reset week"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {activeTab === "overview" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Dashboard
              allowance={allowance}
              totalSpent={totalSpent}
              expenses={expenses}
              totalRecurringWeekly={totalRecurringWeekly}
            />
            <FeedbackMessage 
              allowance={allowance} 
              totalSpent={totalSpent} 
              expenses={expenses}
              goals={goals}
              totalRecurringWeekly={totalRecurringWeekly}
            />

            <AllowanceInput allowance={allowance} onSave={setAllowance} />

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
