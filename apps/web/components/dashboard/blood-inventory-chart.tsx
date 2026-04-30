'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Activity } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const inventoryData = [
  { type: 'O+', units: 41, fill: 'var(--color-chart-1)' },
  { type: 'O-', units: 12, fill: 'var(--color-chart-2)' },
  { type: 'A+', units: 30, fill: 'var(--color-chart-3)' },
  { type: 'A-', units: 6, fill: 'var(--color-chart-4)' },
  { type: 'B+', units: 24, fill: 'var(--color-chart-5)' },
  { type: 'B-', units: 4, fill: 'var(--color-chart-1)' },
  { type: 'AB+', units: 10, fill: 'var(--color-chart-2)' },
  { type: 'AB-', units: 1, fill: 'var(--color-chart-3)' },
];

const chartConfig = {
  units: {
    label: 'Units',
    color: 'var(--primary)',
  },
};

export function BloodInventoryChart() {
  const totalUnits = inventoryData.reduce((sum, item) => sum + item.units, 0);

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Blood Inventory
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalUnits} total units across all hospitals
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inventoryData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="type"
                axisLine={false}
                tickLine={false}
                width={35}
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: 'var(--accent)', opacity: 0.3 }}
              />
              <Bar
                dataKey="units"
                radius={[0, 4, 4, 0]}
                barSize={16}
              >
                {inventoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
