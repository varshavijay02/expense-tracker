import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

function SpendingTrendLine({ data }) {
  const chartData = data.map((item) => ({
    date: item.date,
    expense: item.expense
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
        <XAxis dataKey="date" stroke="#64748B" tickLine={false} />
        <YAxis stroke="#64748B" tickLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#020617', border: '1px solid #1F2937' }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default SpendingTrendLine;

