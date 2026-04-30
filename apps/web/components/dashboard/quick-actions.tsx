'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  UserPlus,
  FileText,
  Phone,
  Zap,
} from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      label: 'New Request',
      description: 'Add blood request',
      icon: Plus,
      href: '/requests?new=true',
      variant: 'default' as const,
    },
    {
      label: 'Add Donor',
      description: 'Register donor',
      icon: UserPlus,
      href: '/donors?new=true',
      variant: 'outline' as const,
    },
    {
      label: 'View Reports',
      description: 'Analytics data',
      icon: FileText,
      href: '/reports',
      variant: 'outline' as const,
    },
    {
      label: 'Call Log',
      description: 'Recent calls',
      icon: Phone,
      href: '/admin',
      variant: 'outline' as const,
    },
  ];

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            className="w-full justify-start h-auto py-3"
            asChild
          >
            <Link href={action.href}>
              <action.icon className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">{action.label}</p>
                <p className="text-xs opacity-70">{action.description}</p>
              </div>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
