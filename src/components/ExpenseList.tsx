import React, { useState } from "react";
import { Expense, Category } from "../types";
import { Trash2, Edit2, Utensils, Car, Gamepad2, GraduationCap, Tag, X, Check } from "lucide-react";

interface Props {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  editingId?: string | null;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Food: <Utensils size={16} />,
  Transport: <Car size={16} />,
  Entertainment: <Gamepad2 size={16} />,
  School: <GraduationCap size={16} />,
};

const getCategoryIcon = (category: string) => {
  return CATEGORY_ICONS[category] || <Tag size={16} />;
};

export function ExpenseList({ expenses, onEdit, onDelete, editingId }: Props) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>No expenses logged yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-800 mb-4">Recent Expenses</h3>
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className={`bg-white p-4 rounded-xl border transition-all flex items-center justify-between group ${
            editingId === expense.id
              ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
              : "border-slate-100 shadow-sm"
          }`}
        >
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1.5 bg-slate-100 rounded-lg text-slate-500 shrink-0">
                  {getCategoryIcon(expense.category)}
                </span>
                <span className="font-medium text-slate-800 truncate">
                  {expense.category}
                </span>
              </div>
              <span className="font-semibold text-slate-800 ml-2 whitespace-nowrap">
                ₱{expense.amount.toFixed(2)}
              </span>
            </div>
            {expense.note && (
              <p className="text-sm text-slate-500 truncate">{expense.note}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              {new Date(expense.timestamp).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="flex gap-2">
            {confirmDeleteId === expense.id ? (
              <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                <button
                  onClick={() => {
                    onDelete(expense.id);
                    setConfirmDeleteId(null);
                  }}
                  className="p-2 text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                  aria-label="Confirm delete"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Cancel delete"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(expense)}
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  aria-label="Edit expense"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(expense.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  aria-label="Delete expense"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
