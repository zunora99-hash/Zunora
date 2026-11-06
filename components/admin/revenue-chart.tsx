"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type RevenueMonth = { month: string; revenue: number };

export function RevenueChart({ data }: { data: RevenueMonth[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => [`Rs. ${value}`, "Revenue"]} />
          <Area type="monotone" dataKey="revenue" stroke="#5b6f3a" fill="#5b6f3a" fillOpacity={0.18} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
