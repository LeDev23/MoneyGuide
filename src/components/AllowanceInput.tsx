import React, { useState } from "react";

interface Props {
  allowance: number;
  allowancePeriod: "weekly" | "monthly";
  onSave: (amount: number, period: "weekly" | "monthly") => void;
}

export function AllowanceInput({ allowance, allowancePeriod, onSave }: Props) {
  const [amount, setAmount] = useState(allowance.toString());
  const [period, setPeriod] = useState<"weekly" | "monthly">(allowancePeriod);

  // Update local state if props change
  React.useEffect(() => {
    setAmount(allowance.toString());
    setPeriod(allowancePeriod);
  }, [allowance, allowancePeriod]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!isNaN(parsed) && parsed >= 0) {
      onSave(parsed, period);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Your Allowance
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
              ₱
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as "weekly" | "monthly")}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-700 font-medium"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors active:scale-95"
        >
          Save
        </button>
      </form>
    </div>
  );
}
