import React, { useState } from "react";
import { RecurringExpense, Category } from "../types";
import { Repeat, Plus, Trash2, Calendar, Utensils, Car, Gamepad2, GraduationCap, Tag } from "lucide-react";

interface Props {
  recurringExpenses: RecurringExpense[];
  onAdd: (expense: Omit<RecurringExpense, "id">) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Food: <Utensils size={14} />,
  Transport: <Car size={14} />,
  Entertainment: <Gamepad2 size={14} />,
  School: <GraduationCap size={14} />,
};

const getCategoryIcon = (category: string) => {
  return CATEGORY_ICONS[category] || <Tag size={14} />;
};

export function RecurringSection({ recurringExpenses, onAdd, onDelete }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [note, setNote] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "custom">("weekly");
  const [customOccurrences, setCustomOccurrences] = useState("3");
  const [customPeriod, setCustomPeriod] = useState<"weekly" | "monthly">("weekly");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!isNaN(parsed) && parsed > 0) {
      onAdd({
        amount: parsed,
        category,
        note: note.trim(),
        frequency,
        ...(frequency === "custom" ? {
          customOccurrences: parseInt(customOccurrences) || 1,
          customPeriod
        } : {})
      });
      setAmount("");
      setNote("");
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Repeat size={20} className="text-emerald-600" />
          Recurring Expenses
        </h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
        >
          <Plus size={14} />
          {isAdding ? "Cancel" : "Add Recurring"}
        </button>
      </div>

      <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50 mb-4">
        <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
          💡 Recurring expenses are automatically deducted from your weekly balance to ensure your "Remaining Balance" always reflects your true discretionary budget.
        </p>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₱</span>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              required
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            required
          >
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Entertainment">Entertainment</option>
            <option value="School">School</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            placeholder="Note (e.g., Netflix, Gym)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            required
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFrequency("daily")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                frequency === "daily" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setFrequency("weekly")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                frequency === "weekly" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setFrequency("monthly")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                frequency === "monthly" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setFrequency("custom")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                frequency === "custom" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              Custom
            </button>
          </div>
          
          {frequency === "custom" && (
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-1">
              <input
                type="number"
                value={customOccurrences}
                onChange={(e) => setCustomOccurrences(e.target.value)}
                className="w-16 px-2 py-1.5 text-center bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                min="1"
                required
              />
              <span className="text-sm text-slate-600 font-medium">times per</span>
              <select
                value={customPeriod}
                onChange={(e) => setCustomPeriod(e.target.value as "weekly" | "monthly")}
                className="flex-1 px-2 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="weekly">Week</option>
                <option value="monthly">Month</option>
              </select>
            </div>
          )}
          <button
            type="submit"
            className="w-full py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors text-sm"
          >
            Save Recurring
          </button>
        </form>
      )}

      <div className="grid gap-3">
        {recurringExpenses.length === 0 && !isAdding && (
          <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-400 font-medium italic">No recurring expenses set</p>
          </div>
        )}
        {recurringExpenses.map((expense) => (
          <div key={expense.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                {getCategoryIcon(expense.category)}
              </div>
              <div>
                <h4 className="font-medium text-slate-800 text-sm">{expense.note}</h4>
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={10} />
                    {expense.frequency === "custom" 
                      ? `${expense.customOccurrences}x / ${expense.customPeriod === "weekly" ? "week" : "month"}`
                      : expense.frequency}
                  </span>
                  <span>•</span>
                  <span>₱{expense.amount.toFixed(2)} {expense.frequency === "custom" ? "/ session" : ""}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onDelete(expense.id)}
              className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
