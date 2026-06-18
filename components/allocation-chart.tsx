"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { allocationData } from "@/lib/mock-data";

const chartFills = ["#38bdf8", "#818cf8", "#22c55e", "#f59e0b", "#f43f5e"];

export function AllocationChart() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Allocation</h2>
        <p className="text-sm text-slate-400">Mock portfolio exposure by asset.</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={allocationData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={3}>
              {allocationData.map((entry, index) => (
                <Cell key={entry.name} fill={chartFills[index % chartFills.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
