'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart3, TrendingUp, PieChartIcon, Activity, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data for charts
const monthlyRequestsData = [
  { month: 'Jan', requests: 45, fulfilled: 40 },
  { month: 'Feb', requests: 52, fulfilled: 48 },
  { month: 'Mar', requests: 61, fulfilled: 55 },
  { month: 'Apr', requests: 58, fulfilled: 54 },
  { month: 'May', requests: 67, fulfilled: 62 },
  { month: 'Jun', requests: 72, fulfilled: 68 },
];

const bloodTypeDistribution = [
  { type: 'O+', value: 35, fill: 'var(--color-chart-1)' },
  { type: 'A+', value: 25, fill: 'var(--color-chart-2)' },
  { type: 'B+', value: 20, fill: 'var(--color-chart-3)' },
  { type: 'AB+', value: 8, fill: 'var(--color-chart-4)' },
  { type: 'O-', value: 5, fill: 'var(--color-chart-5)' },
  { type: 'A-', value: 4, fill: 'var(--color-chart-1)' },
  { type: 'B-', value: 2, fill: 'var(--color-chart-2)' },
  { type: 'AB-', value: 1, fill: 'var(--color-chart-3)' },
];

const urgencyBreakdown = [
  { urgency: 'Critical', count: 12 },
  { urgency: 'High', count: 25 },
  { urgency: 'Moderate', count: 38 },
  { urgency: 'Low', count: 20 },
];

const hospitalRequests = [
  { hospital: 'Kathmandu Medical', requests: 28 },
  { hospital: 'TUTH', requests: 45 },
  { hospital: 'Bir Hospital', requests: 32 },
  { hospital: 'Nepal Cancer', requests: 18 },
  { hospital: 'Dhulikhel', requests: 22 },
];

const chartConfig = {
  requests: {
    label: 'Requests',
    color: 'var(--primary)',
  },
  fulfilled: {
    label: 'Fulfilled',
    color: 'var(--color-chart-2)',
  },
  count: {
    label: 'Count',
    color: 'var(--primary)',
  },
};

export function ReportsContent() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            View detailed reports and analytics on blood bank operations
          </p>
        </div>
        
        {/* Export dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="gap-2 cursor-pointer"
              onClick={() => alert('Exporting as Excel...')}
            >
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              Export as Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 cursor-pointer"
              onClick={() => alert('Exporting as CSV...')}
            >
              <FileText className="h-4 w-4 text-blue-600" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 cursor-pointer"
              onClick={() => alert('Exporting as PDF...')}
            >
              <FileText className="h-4 w-4 text-red-600" />
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-semibold mt-1">355</p>
                <p className="text-xs text-emerald-600 mt-1">+12% from last month</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fulfillment Rate</p>
                <p className="text-2xl font-semibold mt-1">92%</p>
                <p className="text-xs text-emerald-600 mt-1">+3% from last month</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Donors</p>
                <p className="text-2xl font-semibold mt-1">128</p>
                <p className="text-xs text-emerald-600 mt-1">+8 new this month</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-semibold mt-1">2.4h</p>
                <p className="text-xs text-emerald-600 mt-1">-15% from last month</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2">
                <PieChartIcon className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly requests trend */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Monthly Request Trends</CardTitle>
            <p className="text-sm text-muted-foreground">
              Requests vs fulfillments over the past 6 months
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRequestsData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="requests"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--primary)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="fulfilled"
                    stroke="var(--color-chart-2)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-chart-2)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Blood type distribution */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Blood Type Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">
              Percentage of requests by blood type
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={bloodTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="type"
                    label={({ type, value }) => `${type}: ${value}%`}
                    labelLine={false}
                  >
                    {bloodTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Urgency breakdown */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Urgency Breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">
              Request distribution by urgency level
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={urgencyBreakdown} layout="vertical">
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="urgency"
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    fill="var(--primary)"
                    radius={[0, 4, 4, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Hospital requests */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Requests by Hospital</CardTitle>
            <p className="text-sm text-muted-foreground">
              Top hospitals by request volume
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hospitalRequests}>
                  <XAxis
                    dataKey="hospital"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="requests"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
