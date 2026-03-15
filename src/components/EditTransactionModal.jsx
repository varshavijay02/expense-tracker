import React, { useEffect, useState } from 'react';

function EditTransactionModal({ open, transaction, categories, onClose, onSave }) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount?.toString() ?? '');
      setCategoryId(transaction.category_id ?? '');
    }
  }, [transaction]);

  if (!open || !transaction) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount)) return;
    onSave({
      id: transaction.id,
      amount: parsedAmount,
      categoryId: categoryId || null
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="bg-card rounded-xl border border-slate-800 w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">Edit Transaction</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-xs text-slate-500">
            {transaction.date} • {transaction.description}
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Category</label>
            <select
              value={categoryId ?? ''}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Uncategorized</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-xs text-slate-300 border border-slate-700 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 rounded-lg text-xs bg-primary text-white hover:bg-blue-500"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTransactionModal;

