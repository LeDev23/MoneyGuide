import React from "react";
import { Expense, Goal, Category } from "../types";
import { AlertCircle, TrendingDown, CheckCircle2, Target, Repeat } from "lucide-react";

interface Props {
  allowance: number;
  totalSpent: number;
  expenses: Expense[];
  goals: Goal[];
  totalRecurring: number;
}

export function FeedbackMessage({ allowance, totalSpent, expenses, goals, totalRecurring }: Props) {
  if (allowance === 0) return null;

  const totalDeductions = totalSpent + totalRecurring;
  const remaining = allowance - totalDeductions;
  const percentageSpent = (totalDeductions / allowance) * 100;

  // Category analysis
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const isFoodHigh = (categoryTotals["Food"] || 0) / totalSpent > 0.5;

  // Goal analysis
  const closestGoal = [...goals].sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount))[0];

  let insights: { text: string; icon: React.ReactNode; color: string }[] = [];

  // Budget Status
  if (percentageSpent >= 100) {
    insights.push({
      text: `Budget exceeded by ₱${Math.abs(remaining).toFixed(2)}. Immediate spending freeze recommended.`,
      icon: <AlertCircle size={18} />,
      color: "text-rose-800 bg-rose-50 border-rose-100",
    });
  } else if (percentageSpent >= 80) {
    insights.push({
      text: `Critical budget level: ${percentageSpent.toFixed(0)}% reached. Prioritize essential expenses only.`,
      icon: <TrendingDown size={18} />,
      color: "text-amber-800 bg-amber-50 border-amber-100",
    });
  } else {
    insights.push({
      text: `Financial status: Stable. ₱${remaining.toFixed(2)} available for remaining period.`,
      icon: <CheckCircle2 size={18} />,
      color: "text-emerald-800 bg-emerald-50 border-emerald-100",
    });
  }

  // Category insights
  if (topCategory && topCategory[1] > allowance * 0.3) {
    insights.push({
      text: `High concentration in ${topCategory[0]}: ${((topCategory[1] / totalSpent) * 100).toFixed(0)}% of total spend.`,
      icon: <AlertCircle size={18} />,
      color: "text-slate-700 bg-slate-100 border-slate-200",
    });
  }

  if (isFoodHigh) {
    insights.push({
      text: "Food expenses are dominating your budget. Consider meal planning to optimize costs.",
      icon: <TrendingDown size={18} />,
      color: "text-slate-700 bg-slate-100 border-slate-200",
    });
  }

  // Recurring insight
  if (totalRecurring > allowance * 0.4) {
    insights.push({
      text: `Fixed costs are high: ₱${totalRecurring.toFixed(2)} (${((totalRecurring / allowance) * 100).toFixed(0)}% of allowance).`,
      icon: <Repeat size={18} />,
      color: "text-slate-700 bg-slate-100 border-slate-200",
    });
  }

  // Goal insights
  if (closestGoal) {
    const progress = (closestGoal.currentAmount / closestGoal.targetAmount) * 100;
    if (progress > 75) {
      insights.push({
        text: `Goal Milestone: "${closestGoal.name}" is ${progress.toFixed(0)}% complete. Almost there!`,
        icon: <Target size={18} />,
        color: "text-emerald-800 bg-emerald-50 border-emerald-100",
      });
    }
  }

  return (
    <div className="space-y-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 ml-1">Financial Intelligence Report</h3>
      {insights.map((insight, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-2xl border flex items-start gap-3 transition-all hover:shadow-sm ${insight.color}`}
        >
          <span className="shrink-0 mt-0.5">{insight.icon}</span>
          <p className="text-sm font-medium leading-relaxed">{insight.text}</p>
        </div>
      ))}
    </div>
  );
}
