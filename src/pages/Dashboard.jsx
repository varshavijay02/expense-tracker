import React, { useEffect, useState } from 'react';
import SummaryCard from '../components/SummaryCard';
import SpendingByCategoryPie from '../components/charts/SpendingByCategoryPie';
import SpendingTrendLine from '../components/charts/SpendingTrendLine';

function Dashboard({ email, onEmailConnect }) {
  const [summary, setSummary] = useState({
    totalExpense: 0,
    totalIncome: 0,
    savings: 0,
    byCategory: [],
    trend: [],
    recent: []
  });
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    if (window.api?.getDashboardSummary) {
      window.api.getDashboardSummary().then(setSummary);
    }
  }, []);

  const handleConnect = () => {
    if (!emailInput) return;
    onEmailConnect(emailInput);
    setEmailInput('');
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Overview of your personal finances</p>
        </div>
        <div className="flex items-center gap-3">
          {email ? (
            <div className="text-xs text-slate-400">
              Connected Gmail: <span className="text-text font-medium">{email}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@example.com"
                className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleConnect}
                className="px-3 py-2 rounded-lg text-xs bg-primary text-white hover:bg-blue-500"
              >
                Connect Gmail
              </button>
            </div>
          )}
        </div>
      </header>

      <section className="grid grid-cols-3 gap-4">
        <SummaryCard
          label="Total Spent"
          value={`$${summary.totalExpense.toFixed(2)}`}
        />
        <SummaryCard
          label="Total Income"
          value={`$${summary.totalIncome.toFixed(2)}`}
        />
        <SummaryCard
          label="Savings"
          value={`$${summary.savings.toFixed(2)}`}
        />
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-slate-800 p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-text">Spending by category</h2>
          </div>
          <SpendingByCategoryPie data={summary.byCategory} />
        </div>
        <div className="bg-card rounded-xl border border-slate-800 p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-text">Spending trend</h2>
          </div>
          <SpendingTrendLine data={summary.trend} />
        </div>
      </section>

      <section className="bg-card rounded-xl border border-slate-800 p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-text">Recent transactions</h2>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-800">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-900/60 text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Date</th>
                <th className="px-3 py-2 text-left font-medium">Description</th>
                <th className="px-3 py-2 text-left font-medium">Category</th>
                <th className="px-3 py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {summary.recent.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/40">
                  <td className="px-3 py-2">{tx.date}</td>
                  <td className="px-3 py-2">{tx.description}</td>
                  <td className="px-3 py-2 text-slate-400">{tx.category || '-'}</td>
                  <td className={`px-3 py-2 text-right ${tx.type === 'expense' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              {summary.recent.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={4}>
                    No recent transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;

