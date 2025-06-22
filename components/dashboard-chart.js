"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { name: "Mon", users: 120, attempts: 85 },
  { name: "Tue", users: 132, attempts: 97 },
  { name: "Wed", users: 145, attempts: 105 },
  { name: "Thu", users: 150, attempts: 112 },
  { name: "Fri", users: 168, attempts: 123 },
  { name: "Sat", users: 182, attempts: 140 },
  { name: "Sun", users: 176, attempts: 135 },
]

export function DashboardChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="users"
            stroke="#3b82f6"
            strokeWidth={2}
            activeDot={{ r: 6 }}
            name="Active Users"
          />
          <Line
            type="monotone"
            dataKey="attempts"
            stroke="#10b981"
            strokeWidth={2}
            activeDot={{ r: 6 }}
            name="Test Attempts"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
