'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  Clock,
  Phone,
  User,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBloodBank } from '@/lib/blood-bank-context';
import { getUrgencyColor, getStatusColor } from '@/lib/dummy-data';
import type { Request } from '@/lib/dummy-data';

interface RequestCardProps {
  request: Request;
  isSelected: boolean;
  onSelect: () => void;
}

export function RequestCard({ request, isSelected, onSelect }: RequestCardProps) {
  const { updateRequest } = useBloodBank();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeRemaining = (neededBy: string) => {
    const now = new Date();
    const deadline = new Date(neededBy);
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) return 'Overdue';
    if (hours < 1) return `${minutes}m left`;
    if (hours < 24) return `${hours}h ${minutes}m left`;
    return `${Math.floor(hours / 24)}d left`;
  };

  const handleStatusChange = (status: Request['status']) => {
    updateRequest(request.id, { status });
  };

  return (
    <Card
      className={cn(
        'border-border shadow-sm cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary border-primary'
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Blood type badge */}
          <div
            className={cn(
              'flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border-2',
              request.urgency === 'critical'
                ? 'bg-red-50 border-red-300'
                : request.urgency === 'high'
                ? 'bg-orange-50 border-orange-300'
                : 'bg-primary/5 border-primary/20'
            )}
          >
            <span
              className={cn(
                'text-xl font-bold',
                request.urgency === 'critical'
                  ? 'text-red-600'
                  : request.urgency === 'high'
                  ? 'text-orange-600'
                  : 'text-primary'
              )}
            >
              {request.bloodType}
            </span>
            <span className="text-xs text-muted-foreground">
              {request.quantity} units
            </span>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">
                    {request.patientName}
                  </h3>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', getUrgencyColor(request.urgency))}
                  >
                    {request.urgency}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {request.hospital}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn('text-xs', getStatusColor(request.status))}
                >
                  {request.status.replace('_', ' ')}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Mark In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('fulfilled')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Fulfilled
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('cancelled')}
                      className="text-destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Request
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Details row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {request.contactPerson}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {request.phone}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(request.requestedAt)} at {formatTime(request.requestedAt)}
              </span>
            </div>

            {/* Notes and deadline */}
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-muted-foreground truncate max-w-[60%]">
                {request.notes}
              </p>
              <Badge
                variant={request.urgency === 'critical' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                <Clock className="h-3 w-3 mr-1" />
                {getTimeRemaining(request.neededBy)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
