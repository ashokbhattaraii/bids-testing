'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useRequestsQuery } from '@/queries';
import { useBloodBank } from '@/lib/blood-bank-context';
import { RequestFilters } from './request-filters';
import { IntelligencePanel } from './intelligence-panel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  MapPin, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUrgencyColor, getStatusColor } from '@/lib/dummy-data';
import type { Request } from '@/lib/dummy-data';

// Fuzzy search with typo tolerance (Levenshtein distance)
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

function fuzzyMatch(text: string, query: string): boolean {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  if (textLower.includes(queryLower)) return true;
  
  if (queryLower.length >= 3) {
    const words = textLower.split(/\s+/);
    for (const word of words) {
      const distance = levenshteinDistance(word, queryLower);
      const threshold = Math.floor(queryLower.length / 3);
      if (distance <= threshold) return true;
    }
  }
  
  return false;
}

const insideValleyLocations = ['Kathmandu', 'Patan', 'Bhaktapur', 'Lalitpur'];

export function RequestsContent() {
  const { requests: fallbackRequests } = useBloodBank();
  const { data: apiRequests, isLoading, isError } = useRequestsQuery();
  const requests = useMemo(
    () => (apiRequests && apiRequests.length > 0 ? apiRequests : fallbackRequests),
    [apiRequests, fallbackRequests]
  );
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (searchQuery) {
        const searchableText = `${request.patientName} ${request.hospital} ${request.bloodType} ${request.id}`;
        if (!fuzzyMatch(searchableText, searchQuery)) {
          return false;
        }
      }

      if (statusFilter !== 'all' && request.status !== statusFilter) {
        return false;
      }

      if (urgencyFilter !== 'all' && request.urgency !== urgencyFilter) {
        return false;
      }

      if (bloodTypeFilter !== 'all' && request.bloodType !== bloodTypeFilter) {
        return false;
      }

      // Date range filter (against neededBy)
      if (fromDate || toDate) {
        const requestDate = new Date(request.neededBy);
        if (fromDate) {
          const from = new Date(fromDate);
          from.setHours(0, 0, 0, 0);
          if (requestDate < from) return false;
        }
        if (toDate) {
          const to = new Date(toDate);
          to.setHours(23, 59, 59, 999);
          if (requestDate > to) return false;
        }
      }

      return true;
    });
  }, [requests, searchQuery, statusFilter, urgencyFilter, bloodTypeFilter, fromDate, toDate]);

  const [insideValleyRequests, outsideValleyRequests] = useMemo(() => {
    const inside: Request[] = [];
    const outside: Request[] = [];

    for (const r of filteredRequests) {
      const isInside = r.location
        ? r.location === 'inside_valley'
        : insideValleyLocations.some((loc) =>
            r.hospital.toLowerCase().includes(loc.toLowerCase())
          );
      if (isInside) {
        inside.push(r);
      } else {
        outside.push(r);
      }
    }

    return [inside, outside] as const;
  }, [filteredRequests]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTimeRemaining = (neededBy: string) => {
    const now = new Date();
    const deadline = new Date(neededBy);
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (diff < 0) return 'Overdue';
    if (hours < 1) return `${Math.floor(diff / (1000 * 60))}m left`;
    if (hours < 24) return `${hours}h left`;
    return `${Math.floor(hours / 24)}d left`;
  };

  const handleStatusChange = (id: string, status: Request['status']) => {
    // Status updates are not wired to the backend yet.
    // Keep the UI responsive while the list is fetched from the API.
    console.warn('Status update not implemented in API yet', id, status);
  };

  const renderRequestsTable = (requestList: Request[]) => (
    <Card className="border-border shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-20">Blood</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requestList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              requestList.map((request) => (
                <TableRow 
                  key={request.id}
                  className={cn(
                    'cursor-pointer hover:bg-muted/50 transition-colors',
                    selectedRequest?.id === request.id && 'bg-primary/5'
                  )}
                  onClick={() => setSelectedRequest(request)}
                >
                  <TableCell>
                    <div
                      className={cn(
                        'inline-flex items-center justify-center px-2 py-1 rounded-md text-sm font-bold',
                        request.urgency === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : request.urgency === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-primary/10 text-primary'
                      )}
                    >
                      {request.bloodType}
                    </div>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {request.quantity} units
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{request.patientName}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[150px] truncate">
                    {request.hospital}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', getUrgencyColor(request.urgency))}
                    >
                      {request.urgency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', getStatusColor(request.status))}
                    >
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(request.requestedAt)}
                    <span className="block text-xs">{formatTime(request.requestedAt)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getTimeRemaining(request.neededBy) === 'Overdue' ? 'destructive' : 'secondary'}
                      className="text-xs gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      {getTimeRemaining(request.neededBy)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/requests/${request.id}/edit`)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Request
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'in_progress')}>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Mark In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'fulfilled')}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Fulfilled
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(request.id, 'cancelled')}
                          className="text-destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Request
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Blood Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all blood donation requests
          </p>
        </div>
        <Button onClick={() => router.push('/requests/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Filters */}
      <RequestFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        urgencyFilter={urgencyFilter}
        onUrgencyChange={setUrgencyFilter}
        bloodTypeFilter={bloodTypeFilter}
        onBloodTypeChange={setBloodTypeFilter}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
      />

      {isLoading ? (
        <Card className="border-border shadow-sm">
          <CardContent className="text-center text-muted-foreground">Loading incoming requests...</CardContent>
        </Card>
      ) : isError ? (
        <Card className="border-border shadow-sm">
          <CardContent className="text-center text-destructive">Unable to load requests. Please refresh.</CardContent>
        </Card>
      ) : null}

      {/* Main content with intelligence panel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Requests list */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="inside" className="w-full">
            <TabsList className="mb-4 bg-muted/50">
              <TabsTrigger value="inside" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Inside Valley
                <Badge variant="secondary" className="ml-1 text-xs">
                  {insideValleyRequests.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="outside" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Outside Valley
                <Badge variant="secondary" className="ml-1 text-xs">
                  {outsideValleyRequests.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inside" className="mt-0">
              {renderRequestsTable(insideValleyRequests)}
            </TabsContent>

            <TabsContent value="outside" className="mt-0">
              {renderRequestsTable(outsideValleyRequests)}
            </TabsContent>
          </Tabs>
        </div>

        {/* Intelligence panel */}
        <div>
          <IntelligencePanel selectedRequest={selectedRequest} />
        </div>
      </div>

      {/* Editing now navigates to an edit page */}
    </div>
  );
}
