'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  Clock,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardsProps {
  stats: {
    totalRequests: number;
    pendingRequests: number;
    criticalRequests: number;
    activeDonors: number;
    totalDonors: number;
  };
}

export function KPICards({ stats }: KPICardsProps) {
  const kpis = [
    {
      title: 'Total Requests',
      value: stats.totalRequests,
      icon: FileText,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Pending',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Critical',
      value: stats.criticalRequests,
      icon: AlertTriangle,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Donors',
      value: `${stats.activeDonors}/${stats.totalDonors}`,
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className={cn('rounded-xl p-3', kpi.bgColor)}>
                <kpi.icon className={cn('h-6 w-6', kpi.color)} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
