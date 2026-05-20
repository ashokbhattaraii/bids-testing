'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequestsResponseQuery } from '@/queries';
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
  Plus, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Pencil,
  
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { requestApi } from '@/lib/routes';
import { REQUEST_QUERY_KEYS } from '@/lib/constant';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getUrgencyColor, getStatusColor } from '@/lib/dummy-data';
import type { Request, RequestListParams } from '@/types';

const insideValleyLocations = ['Kathmandu', 'Patan', 'Bhaktapur', 'Lalitpur'];

export function RequestsContent() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);


  // Debounce search input to avoid excessive API requests
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const listParams = useMemo<RequestListParams>(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      status: statusFilter as RequestListParams['status'],
      urgency: urgencyFilter as RequestListParams['urgency'],
      bloodType: bloodTypeFilter,
      from: fromDate || undefined,
      to: toDate || undefined,
    }),
    [page, limit, debouncedSearch, statusFilter, urgencyFilter, bloodTypeFilter, fromDate, toDate]
  );

  const { data: apiResponse, isLoading, isError } = useRequestsResponseQuery(listParams);
  const requests = apiResponse?.items ?? [];
  const paginationMeta = apiResponse?.meta;

  // Reset to first page when filters (including debounced search) change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, urgencyFilter, bloodTypeFilter, fromDate, toDate]);

  const [insideValleyRequests, outsideValleyRequests] = useMemo(() => {
    const inside: Request[] = [];
    const outside: Request[] = [];

    for (const r of requests) {
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
  }, [requests]);



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

  const queryClient = useQueryClient();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmingRequestId, setConfirmingRequestId] = useState<string | null>(null);
  const [confirmingAction, setConfirmingAction] = useState<Request['status'] | null>(null);

  const openConfirmDialog = (id: string, action: Request['status']) => {
    setConfirmingRequestId(id);
    setConfirmingAction(action);
    setIsConfirmDialogOpen(true);
  };

  const updateStatus = async (id: string, status: Request['status']) => {
    try {
      await requestApi.update(id, { status });
      await queryClient.invalidateQueries({ queryKey: REQUEST_QUERY_KEYS.list });
    } catch (e) {
      console.error('Failed to update request status', e);
    }
  };

  const confirmAction = async () => {
    if (!confirmingRequestId || !confirmingAction) return;
    setIsConfirmDialogOpen(false);
    try {
      await requestApi.update(confirmingRequestId, { status: confirmingAction });
      await queryClient.invalidateQueries({ queryKey: REQUEST_QUERY_KEYS.list });
    } catch (e) {
      console.error('Failed to update request status', e);
    } finally {
      setConfirmingRequestId(null);
      setConfirmingAction(null);
    }
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
              <TableHead className="w-32">Actions</TableHead>
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
                  onClick={() => {
                    setSelectedRequest(request);
                    router.push(`/requests/${request.id}/edit`);
                  }}
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
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/requests/${request.id}/edit`);
                            }}
                            aria-label="Edit Request"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>Edit Request</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openConfirmDialog(request.id, 'in_progress');
                            }}
                            aria-label="Mark In Progress"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>Mark In Progress</TooltipContent>
                      </Tooltip>

                      {/* Mark Fulfilled removed — requests are fulfilled when additional details are provided */}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openConfirmDialog(request.id, 'cancelled');
                            }}
                            aria-label="Cancel Request"
                            className="text-destructive"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>Cancel Request</TooltipContent>
                      </Tooltip>
                    </div>
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

      <Card className="border-border shadow-sm">
        <CardContent className="flex items-center justify-between gap-3 py-3">
          <p className="text-sm text-muted-foreground">
            {paginationMeta
              ? `Page ${paginationMeta.page} of ${paginationMeta.totalPages} • ${paginationMeta.total} total requests`
              : 'Pagination unavailable'}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!paginationMeta?.hasPrevPage || isLoading}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!paginationMeta?.hasNextPage || isLoading}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Editing now navigates to an edit page */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmingAction === 'cancelled' ? 'Cancel Request' : 'Confirm Action'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {confirmingAction === 'cancelled'
              ? 'Are you sure you want to cancel this request? This action cannot be undone.'
              : `Mark this request as ${confirmingAction?.replace('_', ' ')}?`}
          </p>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="ghost" onClick={() => setIsConfirmDialogOpen(false)}>Close</Button>
            <Button variant={confirmingAction === 'cancelled' ? 'destructive' : 'default'} onClick={confirmAction}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
