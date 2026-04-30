'use client';

import { useBloodBank } from '@/lib/blood-bank-context';
import { Badge } from '@/components/ui/badge';
import { Clock, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUrgencyColor, getStatusColor, type Request } from '@/lib/dummy-data';

interface RecentRequestsProps {
  requests?: Request[];
}

export function RecentRequests({ requests: propRequests }: RecentRequestsProps) {
  const { requests: contextRequests } = useBloodBank();
  const requests = propRequests || contextRequests;

  // Get recent requests, sorted by date (new requests at top unless managed)
  const recentRequests = [...requests]
    .sort((a, b) => {
      // Pending/in_progress requests come first
      if (a.status !== 'fulfilled' && b.status === 'fulfilled') return -1;
      if (a.status === 'fulfilled' && b.status !== 'fulfilled') return 1;
      // Then sort by date
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
    })
    .slice(0, 5);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-3">
      {recentRequests.map((request) => (
        <div
          key={request.id}
          className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors"
        >
          {/* Blood type badge */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-base font-bold text-primary">
              {request.bloodType}
            </span>
          </div>

          {/* Request info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground">
              {request.patientName}
            </h4>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <Building2 className="h-3.5 w-3.5" />
              {request.hospital}
            </p>
          </div>

          {/* Meta info */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(request.requestedAt)}
          </div>

          <div className="hidden md:block text-sm text-muted-foreground">
            {request.quantity} units
          </div>

          <Badge
            variant="outline"
            className={cn('shrink-0', getUrgencyColor(request.urgency))}
          >
            {request.urgency}
          </Badge>

          <Badge
            variant="outline"
            className={cn('shrink-0 hidden sm:inline-flex', getStatusColor(request.status))}
          >
            {request.status.replace('_', ' ')}
          </Badge>
        </div>
      ))}
    </div>
  );
}
