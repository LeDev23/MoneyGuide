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
import { Wallet, RefreshCw, LayoutDashboard, Target, Repeat, LogOut } from "lucide-react";
import { auth, db, loginWithGoogle, logout, handleFirestoreError, OperationType } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc, query, orderBy } from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "goals" | "recurring">("overview");

  const [allowance, setAllowance] = useState<number>(0);
  const [allowancePeriod, setAllowancePeriod] = useState<"weekly" | "monthly">("weekly");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    const userDocRef = doc(db, "users", user.uid);
    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAllowance(data.allowance || 0);
        setAllowancePeriod(data.allowancePeriod || "weekly");
      } else {
        setAllowance(0);
        setAllowancePeriod("weekly");
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

    const expensesRef = collection(db, "users", user.uid, "expenses");
    const qExpenses = query(expensesRef, orderBy("timestamp", "desc"));
    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      const exps: Expense[] = [];
      snapshot.forEach((doc) => exps.push({ id: doc.id, ...doc.data() } as Expense));
      setExpenses(exps);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/expenses`));

    const goalsRef = collection(db, "users", user.uid, "goals");
    const unsubGoals = onSnapshot(goalsRef, (snapshot) => {
      const gs: Goal[] = [];
      snapshot.forEach((doc) => gs.push({ id: doc.id, ...doc.data() } as Goal));
      setGoals(gs);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/goals`));

    const recurringRef = collection(db, "users", user.uid, "recurringExpenses");
    const unsubRecurring = onSnapshot(recurringRef, (snapshot) => {
      const res: RecurringExpense[] = [];
      snapshot.forEach((doc) => res.push({ id: doc.id, ...doc.data() } as RecurringExpense));
      setRecurringExpenses(res);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/recurringExpenses`));

    return () => {
      unsubUser();
      unsubExpenses();
      unsubGoals();
      unsubRecurring();
    };
  }, [user, isAuthReady]);

  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="text-emerald-600 mb-6">
          <Wallet size={64} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">MoneyGuide</h1>
        <p className="text-slate-500 mb-8 text-center max-w-xs">Track your allowance, manage expenses, and reach your savings goals.</p>
        <button
          onClick={loginWithGoogle}
          className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
        >
          Sign in with Google
        </button>
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
    try {
      await setDoc(doc(db, "users", user.uid), { allowance: newAllowance, allowancePeriod: period, uid: user.uid }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const handleSaveExpense = async (expenseData: Omit<Expense, "id" | "timestamp">) => {
    try {
      if (editingExpense) {
        await updateDoc(doc(db, "users", user.uid, "expenses", editingExpense.id), {
          ...expenseData
        });
        setEditingExpense(null);
      } else {
        const newId = crypto.randomUUID();
        await setDoc(doc(db, "users", user.uid, "expenses", newId), {
          ...expenseData,
          timestamp: Date.now(),
          uid: user.uid
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/expenses`);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "expenses", id));
      if (editingExpense?.id === id) {
        setEditingExpense(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/expenses/${id}`);
    }
  };

  const handleAddGoal = async (goalData: Omit<Goal, "id">) => {
    try {
      const newId = crypto.randomUUID();
      await setDoc(doc(db, "users", user.uid, "goals", newId), {
        ...goalData,
        uid: user.uid
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/goals`);
    }
  };

  const handleUpdateGoal = async (id: string, amount: number) => {
    try {
      const goal = goals.find(g => g.id === id);
      if (goal) {
        await updateDoc(doc(db, "users", user.uid, "goals", id), {
          currentAmount: goal.currentAmount + amount
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/goals/${id}`);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "goals", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/goals/${id}`);
    }
  };

  const handleAddRecurring = async (reData: Omit<RecurringExpense, "id">) => {
    try {
      const newId = crypto.randomUUID();
      await setDoc(doc(db, "users", user.uid, "recurringExpenses", newId), {
        ...reData,
        uid: user.uid
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/recurringExpenses`);
    }
  };

  const handleDeleteRecurring = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "recurringExpenses", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/recurringExpenses/${id}`);
    }
  };

  const handleReset = async () => {
    try {
      for (const exp of expenses) {
        await deleteDoc(doc(db, "users", user.uid, "expenses", exp.id));
      }
      setEditingExpense(null);
      setShowResetConfirm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/expenses`);
    }
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
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
              aria-label="Logout"
            >
              <LogOut size={20} />
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
