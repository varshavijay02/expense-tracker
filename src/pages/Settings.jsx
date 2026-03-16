import React from 'react';

function Settings({ email, onEmailChange }) {
  const [input, setInput] = React.useState(email || '');

  const handleRefresh = async () => {
    if (window.api?.fetchNewTransactions) {
      await window.api.fetchNewTransactions();
    }
  };

  const handleExport = () => {
    // Placeholder for CSV export trigger (handled via Electron in a full setup)
    // This demo keeps the button for layout.
  };

  const handleSaveEmail = () => {
    if (input) onEmailChange(input);
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-text">Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Account and data settings</p>
      </header>

      <section className="bg-card rounded-xl border border-slate-800 p-4 space-y-4 max-w-xl">
        <div>
          <h2 className="text-sm font-semibold text-text mb-2">Connected email</h2>
          <div className="flex gap-2 items-center">
            <input
              type="email"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleSaveEmail}
              className="px-3 py-2 rounded-lg text-xs bg-primary text-white hover:bg-blue-500"
            >
              Save
            </button>
          </div>
          {email && (
            <div className="text-xs text-slate-500 mt-1">
              Currently connected as <span className="text-text font-medium">{email}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="px-4 py-2 rounded-lg text-xs border border-slate-700 text-slate-100 hover:bg-slate-800"
          >
            Refresh statements
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 rounded-lg text-xs bg-primary text-white hover:bg-blue-500"
          >
            Export CSV
          </button>
        </div>
      </section>
    </div>
  );
}

export default Settings;

