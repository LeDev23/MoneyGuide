import React, { useState, useEffect, useRef } from "react";
import { Category, Expense } from "../types";

interface Props {
  onSave: (expense: Omit<Expense, "id" | "timestamp">) => void;
  editingExpense?: Expense | null;
  onCancelEdit?: () => void;
}

const PRESET_CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "School",
];

export function ExpenseForm({ onSave, editingExpense, onCancelEdit }: Props) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("Food");
  const [customCategory, setCustomCategory] = useState("");
  const [note, setNote] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      if (PRESET_CATEGORIES.includes(editingExpense.category)) {
        setCategory(editingExpense.category);
        setCustomCategory("");
      } else {
        setCategory("Other");
        setCustomCategory(editingExpense.category);
      }
      setNote(editingExpense.note);
      
      // Scroll to form when editing starts
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setAmount("");
      setCategory("Food");
      setCustomCategory("");
      setNote("");
    }
  }, [editingExpense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!isNaN(parsed) && parsed > 0) {
      const finalCategory = category === "Other" ? customCategory.trim() || "Other" : category;
      onSave({
        amount: parsed,
        category: finalCategory,
        note: note.trim(),
      });
      if (!editingExpense) {
        setAmount("");
        setNote("");
        setCategory("Food");
        setCustomCategory("");
      }
    }
  };

  return (
    <div 
      ref={formRef}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 transition-all"
    >
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        {editingExpense ? "Edit Expense" : "Log Expense"}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
            ₱
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            placeholder="Amount"
            step="0.01"
            min="0.01"
            required
          />
        </div>

        <div className="flex flex-col gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
            required
          >
            {PRESET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="Other">Other (Custom)</option>
          </select>

          {category === "Other" && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all animate-in fade-in slide-in-from-top-2 duration-200"
              placeholder="Category Name (e.g., Shopping)"
              required
            />
          )}
        </div>

        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          placeholder="Note (optional)"
        />

        <div className="flex gap-3 pt-2">
          {editingExpense && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors active:scale-95"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors active:scale-95"
          >
            {editingExpense ? "Update" : "Save Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}
