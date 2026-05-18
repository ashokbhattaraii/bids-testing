'use client';

import { useState, useCallback } from 'react';
import { useDonors, useUpdateDonor } from '@/queries/donors';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  UserCheck,
  UserX,
  Phone,
  MapPin,
  Clock,
  Loader2,
} from 'lucide-react';
import type { Donor } from '@/types';

const REMARK_OPTIONS = [
  { value: 'pending',       label: 'Pending'       },
  { value: 'contacted',     label: 'Contacted'     },
  { value: 'not_reachable', label: 'Not Reachable' },
  { value: 'no_answer',     label: 'No Answer'     },
  { value: 'scheduled',     label: 'Scheduled'     },
  { value: 'follow_up',     label: 'Follow Up'     },
];

function getRemarkLabel(value: string | null): string {
  if (!value) return '';
  return REMARK_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

type ActionState = 'verifying' | 'rejecting' | null;

export function UnverifiedDonorsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionState, setActionState] = useState<Record<string, ActionState>>({});
  const [remarkState, setRemarkState] = useState<Record<string, boolean>>({}); // true = saving

  const { donors, isLoading, error, refetch } = useDonors({ status: 'unverified' });
  const { updateDonor } = useUpdateDonor();
  const { toast } = useToast();

  const filtered = donors.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.bloodType.toLowerCase().includes(q) ||
      d.phone.includes(q) ||
      (d.location ?? '').toLowerCase().includes(q)
    );
  });

  const handleVerify = useCallback(async (donor: Donor) => {
    setActionState((s) => ({ ...s, [donor.id]: 'verifying' }));
    try {
      await updateDonor({ id: donor.id, input: { status: 'active' } });
      toast({ title: 'Donor verified', description: `${donor.name} is now active.` });
      void refetch();
    } finally {
      setActionState((s) => ({ ...s, [donor.id]: null }));
    }
  }, [updateDonor, refetch, toast]);

  const handleReject = useCallback(async (donor: Donor) => {
    setActionState((s) => ({ ...s, [donor.id]: 'rejecting' }));
    try {
      await updateDonor({
        id: donor.id,
        input: { status: 'blacklisted', blacklistReason: 'Rejected during verification' },
      });
      toast({ title: 'Donor rejected', description: `${donor.name} has been blacklisted.` });
      void refetch();
    } finally {
      setActionState((s) => ({ ...s, [donor.id]: null }));
    }
  }, [updateDonor, refetch, toast]);

  const handleRemark = useCallback(async (donor: Donor, value: string) => {
    setRemarkState((s) => ({ ...s, [donor.id]: true }));
    try {
      await updateDonor({ id: donor.id, input: { notes: value } });
      void refetch();
    } finally {
      setRemarkState((s) => ({ ...s, [donor.id]: false }));
    }
  }, [updateDonor, refetch]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Unverified Donors</h1>
        <p className="text-muted-foreground mt-1">
          Review and verify new donor registrations
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{donors.length}</p>
              <p className="text-sm text-muted-foreground">Pending Verification</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <UserCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {donors.filter((d) => d.notes === 'contacted').length}
              </p>
              <p className="text-sm text-muted-foreground">Contacted</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <UserX className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {donors.filter((d) => d.notes === 'follow_up').length}
              </p>
              <p className="text-sm text-muted-foreground">Follow Up</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base font-semibold">Unverified Donor List</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, blood type, phone…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <p className="text-sm text-destructive text-center py-8">{error}</p>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              {searchQuery ? 'No donors match your search.' : 'No unverified donors found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((donor) => {
                    const busy = actionState[donor.id];
                    const savingRemark = remarkState[donor.id];
                    const initials = donor.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();

                    // Current remark value: try to match a preset, else fall back to notes
                    const remarkValue =
                      donor.notes &&
                      REMARK_OPTIONS.some((o) => o.value === donor.notes)
                        ? donor.notes
                        : 'pending';

                    return (
                      <TableRow key={donor.id}>
                        {/* Name */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 shrink-0 rounded-full bg-amber-100 flex items-center justify-center">
                              <span className="text-xs font-semibold text-amber-700">
                                {initials}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{donor.name}</p>
                              <p className="text-xs text-muted-foreground">{donor.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Blood type */}
                        <TableCell>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold">
                            {donor.bloodType}
                          </Badge>
                        </TableCell>

                        {/* Contact */}
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {donor.phone}
                            </div>
                            {donor.location && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {donor.location}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Source */}
                        <TableCell>
                          {donor.source ? (
                            <Badge variant="secondary" className="capitalize">
                              {donor.source.replace('_', ' ')}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No source</span>
                          )}
                        </TableCell>

                        {/* Registered */}
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(donor.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </TableCell>

                        {/* Status — always unverified */}
                        <TableCell>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Unverified
                          </Badge>
                        </TableCell>

                        {/* Remarks dropdown */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Select
                              value={remarkValue}
                              onValueChange={(val) => handleRemark(donor, val)}
                              disabled={!!busy || savingRemark}
                            >
                              <SelectTrigger className="h-8 w-36 text-xs">
                                <SelectValue placeholder="Select…" />
                              </SelectTrigger>
                              <SelectContent>
                                {REMARK_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {savingRemark && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-emerald-600 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-500"
                              disabled={!!busy}
                              onClick={() => handleVerify(donor)}
                            >
                              {busy === 'verifying' ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <UserCheck className="h-3.5 w-3.5 mr-1" />
                              )}
                              Verify
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-destructive border-destructive/40 hover:bg-destructive/10"
                              disabled={!!busy}
                              onClick={() => handleReject(donor)}
                            >
                              {busy === 'rejecting' ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <UserX className="h-3.5 w-3.5 mr-1" />
                              )}
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


