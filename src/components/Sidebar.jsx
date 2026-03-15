import React from 'react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'categories', label: 'Categories' },
  { id: 'settings', label: 'Settings' }
];

function Sidebar({ activePage, onChangePage }) {
  return (
    <aside className="w-64 bg-sidebar text-slate-200 flex flex-col border-r border-slate-800">
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="text-lg font-semibold text-text">Finance Tracker</div>
        <div className="text-xs text-slate-500 mt-1">Offline personal dashboard</div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChangePage(item.id)}
            className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition
              ${activePage === item.id ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
            `}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;

