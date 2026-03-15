import React, { useEffect, useState } from 'react';
import EditTransactionModal from '../components/EditTransactionModal';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    startDate: '',
    endDate: ''
  });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    if (window.api?.getTransactions) {
      const tx = await window.api.getTransactions(filters);
      setTransactions(tx);
    }
    if (window.api?.getCategoriesWithTotals) {
      const cats = await window.api.getCategoriesWithTotals();
      setCategories(cats);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
  };

  const applyFilters = async () => {
    if (window.api?.getTransactions) {
      const tx = await window.api.getTransactions(filters);
      setTransactions(tx);
    }
  };

  const handleSave = async (payload) => {
    if (window.api?.updateTransaction) {
      await window.api.updateTransaction(payload);
      setEditing(null);
      await load();
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Transactions</h1>
          <p className="text-xs text-slate-500 mt-1">Search, filter and edit your transactions</p>
        </div>
      </header>

      <section className="bg-card rounded-xl border border-slate-800 p-4 space-y-3">
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Description"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Category</label>
            <select
              value={filters.categoryId}
              onChange={(e) => handleFilterChange('categoryId', e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">From</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">To</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={applyFilters}
            className="px-4 py-2 rounded-lg text-xs bg-primary text-white hover:bg-blue-500"
          >
            Apply filters
          </button>
        </div>
      </section>

      <section className="bg-card rounded-xl border border-slate-800 p-4">
        <div className="overflow-hidden rounded-lg border border-slate-800">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-900/60 text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Date</th>
                <th className="px-3 py-2 text-left font-medium">Description</th>
                <th className="px-3 py-2 text-left font-medium">Category</th>
                <th className="px-3 py-2 text-right font-medium">Amount</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/40">
                  <td className="px-3 py-2">{tx.date}</td>
                  <td className="px-3 py-2">{tx.description}</td>
                  <td className="px-3 py-2 text-slate-400">{tx.category || '-'}</td>
                  <td className={`px-3 py-2 text-right ${tx.type === 'expense' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(tx)}
                      className="px-2 py-1 rounded-md text-xs border border-slate-700 text-slate-200 hover:bg-slate-800"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={5}>
                    No transactions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <EditTransactionModal
        open={!!editing}
        transaction={editing}
        categories={categories}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </div>
  );
}

export default Transactions;

