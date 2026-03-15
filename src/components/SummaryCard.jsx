import React from 'react';

function SummaryCard({ label, value }) {
  return (
    <div className="bg-card rounded-xl px-4 py-3 border border-slate-800 flex flex-col gap-1">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-xl font-semibold text-text">{value}</div>
    </div>
  );
}

export default SummaryCard;

