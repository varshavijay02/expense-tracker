import React, { useEffect, useState } from 'react';
import CategoryBarChart from '../components/charts/CategoryBarChart';

function Categories() {
  const [categories, setCategories] = useState([]);

  const load = async () => {
    if (window.api?.getCategoriesWithTotals) {
      const cats = await window.api.getCategoriesWithTotals();
      setCategories(cats);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalSpending = categories.reduce((sum, c) => sum + (c.total || 0), 0);

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Categories</h1>
          <p className="text-xs text-slate-500 mt-1">Spending breakdown by category</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-slate-800 p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-text">Spending per category</h2>
          </div>
          <CategoryBarChart data={categories} />
        </div>
        <div className="bg-card rounded-xl border border-slate-800 p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-text">Categories list</h2>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-900/60 text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Category</th>
                  <th className="px-3 py-2 text-right font-medium">Total spent</th>
                  <th className="px-3 py-2 text-right font-medium">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {categories.map((c) => {
                  const share = totalSpending ? ((c.total / totalSpending) * 100).toFixed(1) : 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-900/40">
                      <td className="px-3 py-2 flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        <span>{c.name}</span>
                      </td>
                      <td className="px-3 py-2 text-right">${c.total.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right text-slate-400">{share}%</td>
                    </tr>
                  );
                })}
                {categories.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-center text-slate-500" colSpan={3}>
                      No categories yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Categories;

