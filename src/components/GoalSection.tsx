import React, { useState } from "react";
import { Goal } from "../types";
import { Target, Plus, Trash2, TrendingUp } from "lucide-react";

interface Props {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, "id">) => void;
  onUpdateGoal: (id: string, amount: number) => void;
  onDeleteGoal: (id: string) => void;
}

export function GoalSection({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [addingFundsToGoalId, setAddingFundsToGoalId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTarget);
    if (newName && !isNaN(target) && target > 0) {
      onAddGoal({
        name: newName,
        targetAmount: target,
        currentAmount: 0,
      });
      setNewName("");
      setNewTarget("");
      setIsAdding(false);
    }
  };

  const handleCustomAdd = (goalId: string) => {
    const parsed = parseFloat(customAmount);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateGoal(goalId, parsed);
      setAddingFundsToGoalId(null);
      setCustomAmount("");
    }
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Target size={20} className="text-emerald-600" />
          Budget Goals
        </h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
        >
          <Plus size={14} />
          {isAdding ? "Cancel" : "New Goal"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2">
          <input
            type="text"
            placeholder="What are you saving for?"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            required
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₱</span>
            <input
              type="number"
              placeholder="Target Amount"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors text-sm"
          >
            Create Goal
          </button>
        </form>
      )}

      <div className="grid gap-3">
        {goals.length === 0 && !isAdding && (
          <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-400 font-medium italic">No goals set yet</p>
          </div>
        )}
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <div key={goal.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-slate-800">{goal.name}</h4>
                  <p className="text-xs text-slate-500">
                    ₱{goal.currentAmount.toFixed(2)} of ₱{goal.targetAmount.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>{progress.toFixed(0)}% Complete</span>
                  <span>₱{(goal.targetAmount - goal.currentAmount).toFixed(2)} Left</span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                {addingFundsToGoalId === goal.id ? (
                  <div className="flex w-full gap-2 animate-in fade-in slide-in-from-top-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₱</span>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCustomAdd(goal.id);
                          if (e.key === 'Escape') setAddingFundsToGoalId(null);
                        }}
                      />
                    </div>
                    <button
                      onClick={() => handleCustomAdd(goal.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-all"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setAddingFundsToGoalId(null)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onUpdateGoal(goal.id, 50)}
                      className="flex-1 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg text-xs font-medium border border-slate-100 transition-all flex items-center justify-center gap-1"
                    >
                      <TrendingUp size={12} />
                      Add ₱50
                    </button>
                    <button
                      onClick={() => {
                        setAddingFundsToGoalId(goal.id);
                        setCustomAmount("");
                      }}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-medium border border-slate-100 transition-all"
                    >
                      Custom
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
