import React from "react";
import { Expense, Category } from "../types";
import { Utensils, Car, Gamepad2, GraduationCap, Tag } from "lucide-react";

interface Props {
  allowance: number;
  totalSpent: number;
  expenses: Expense[];
  totalRecurringWeekly: number;
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

export function Dashboard({ allowance, totalSpent, expenses, totalRecurringWeekly }: Props) {
  const totalDeductions = totalSpent + totalRecurringWeekly;
  const remaining = allowance - totalDeductions;
  const percentageSpent = allowance > 0 ? (totalDeductions / allowance) * 100 : 0;

  const allCategories = Array.from(new Set(expenses.map((e) => e.category)));

  const categoryTotals = allCategories
    .map((cat) => {
      const total = expenses
        .filter((exp) => exp.category === cat)
        .reduce((sum, exp) => sum + exp.amount, 0);
      return { category: cat, total };
    })
    .sort((a, b) => b.total - a.total);

  let statusColor = "text-emerald-600";
  let bgColor = "bg-emerald-50";
  let progressColor = "bg-emerald-500";

  if (percentageSpent >= 100) {
    statusColor = "text-rose-600";
    bgColor = "bg-rose-50";
    progressColor = "bg-rose-500";
  } else if (percentageSpent >= 90) {
    statusColor = "text-amber-600";
    bgColor = "bg-amber-50";
    progressColor = "bg-amber-500";
  }

  return (
    <div className="space-y-4 mb-6">
      <div className={`p-6 rounded-2xl transition-colors ${bgColor}`}>
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">
              Remaining Balance
            </p>
            <h1 className={`text-4xl font-bold tracking-tight ${statusColor}`}>
              ₱{remaining.toFixed(2)}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Deductions</p>
            <p className="text-lg font-semibold text-slate-700">
              ₱{totalDeductions.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="h-3 w-full bg-white/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${Math.min(percentageSpent, 100)}%` }}
          />
        </div>
        
        <div className="mt-3 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <div className="flex gap-3">
            <span>Spent: ₱{totalSpent.toFixed(2)}</span>
            <span>Fixed: ₱{totalRecurringWeekly.toFixed(2)}</span>
          </div>
          <span>Allowance: ₱{allowance.toFixed(2)}</span>
        </div>
      </div>

      {categoryTotals.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">
            Spending by Category
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {categoryTotals.map(({ category, total }) => (
              <div
                key={category}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-slate-400">
                    {getCategoryIcon(category)}
                  </span>
                  <p className="text-xs font-medium text-slate-500">
                    {category}
                  </p>
                </div>
                <p className="text-lg font-bold text-slate-800">
                  ₱{total.toFixed(2)}
                </p>
                <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${(total / totalSpent) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
