import React from 'react';
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer
} from 'recharts';

function SpendingByCategoryPie({ data }) {
  const total = data.reduce((sum, item) => sum + (item.total || 0), 0);
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.total,
    color: item.color
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.color} stroke="#020617" strokeWidth={1} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => {
            const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
            return [`${value.toFixed(2)} (${percentage}%)`, name];
          }}
          contentStyle={{ backgroundColor: '#020617', border: '1px solid #1F2937' }}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          formatter={(value, entry) => {
            const item = chartData.find((d) => d.name === value);
            const percentage = item && total ? ((item.value / total) * 100).toFixed(1) : 0;
            return `${value} • ${percentage}%`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default SpendingByCategoryPie;

