import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

function CategoryBarChart({ data }) {
  const chartData = data.map((item) => ({
    name: item.name,
    total: item.total,
    color: item.color
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
        <XAxis dataKey="name" stroke="#64748B" tickLine={false} />
        <YAxis stroke="#64748B" tickLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#020617', border: '1px solid #1F2937' }}
        />
        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default CategoryBarChart;

