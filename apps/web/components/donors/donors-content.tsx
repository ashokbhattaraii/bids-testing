'use client';

import { useState, useMemo } from 'react';
import { useBloodBank } from '@/lib/blood-bank-context';
import { DonorGrid } from './donor-grid';
import { DonorFilters } from './donor-filters';
import { NewDonorDialog } from './new-donor-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function DonorsContent() {
  const { donors } = useBloodBank();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>('all');
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

  // Filter donors
  const filteredDonors = useMemo(() => {
    return donors.filter((donor) => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const searchable = `${donor.name} ${donor.phone} ${donor.location} ${donor.bloodType}`.toLowerCase();
        if (!searchable.includes(searchLower)) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && donor.status !== statusFilter) return false;

      // Blood type filter
      if (bloodTypeFilter !== 'all' && donor.bloodType !== bloodTypeFilter) return false;

      return true;
    });
  }, [donors, searchQuery, statusFilter, bloodTypeFilter]);

  // Stats
  const stats = {
    total: donors.length,
    available: donors.filter((d) => d.status === 'available').length,
    unavailable: donors.filter((d) => d.status === 'unavailable').length,
    blacklisted: donors.filter((d) => d.status === 'blacklisted').length,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Donor Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage registered blood donors and their availability
          </p>
        </div>
        <Button onClick={() => setIsNewDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Donor
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Donors</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.available}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.unavailable}</p>
              <p className="text-sm text-muted-foreground">Unavailable</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.blacklisted}</p>
              <p className="text-sm text-muted-foreground">Blacklisted</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <DonorFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        bloodTypeFilter={bloodTypeFilter}
        onBloodTypeChange={setBloodTypeFilter}
      />

      {/* Donor grid */}
      <DonorGrid donors={filteredDonors} />

      {/* New donor dialog */}
      <NewDonorDialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen} />
    </div>
  );
}
