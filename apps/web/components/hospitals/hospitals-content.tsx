'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCreateHospitalMutation, useHospitalsResponseQuery } from '@/queries';
import type { HospitalOption } from '@/lib/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2,
  MapPin,
  Phone,
  User,
  Search,
  Droplet,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as const;
const emptyBloodInventory: Record<(typeof bloodTypes)[number], number> = {
  'O+': 0,
  'O-': 0,
  'A+': 0,
  'A-': 0,
  'B+': 0,
  'B-': 0,
  'AB+': 0,
  'AB-': 0,
};

const getStockLevel = (units: number) => {
  if (units === 0) return { label: 'Out', color: 'bg-red-500', textColor: 'text-red-700' };
  if (units <= 2) return { label: 'Critical', color: 'bg-red-500', textColor: 'text-red-700' };
  if (units <= 5) return { label: 'Low', color: 'bg-amber-500', textColor: 'text-amber-700' };
  if (units <= 10) return { label: 'Moderate', color: 'bg-blue-500', textColor: 'text-blue-700' };
  return { label: 'Good', color: 'bg-emerald-500', textColor: 'text-emerald-700' };
};

export function HospitalsContent() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [valleyFilter, setValleyFilter] = useState<'all' | 'inside_valley' | 'outside_valley'>('all');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const listParams = useMemo(() => {
    return {
      page,
      limit,
      search: debouncedSearch || undefined,
      valley: valleyFilter === 'all' ? undefined : (valleyFilter as 'inside_valley' | 'outside_valley'),
    };
  }, [page, limit, debouncedSearch, valleyFilter]);

  // Reset page when filters change
  useEffect(() => setPage(1), [debouncedSearch, valleyFilter]);

  const {
    data: apiHospitalsData,
    isLoading: isHospitalsLoading,
    isError: isHospitalsError,
  } = useHospitalsResponseQuery(listParams);
  const createHospitalMutation = useCreateHospitalMutation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(searchParams.get('openForm') === 'true');
  const [newHospital, setNewHospital] = useState({
    name: '',
    location: '',
    contactPerson: '',
    phone: '',
    valley: 'inside_valley' as 'inside_valley' | 'outside_valley',
  });

  const handleAddHospital = async () => {
    if (!newHospital.name.trim() || !newHospital.location.trim()) return;

    await createHospitalMutation.mutateAsync({
      name: newHospital.name.trim(),
      location: newHospital.location.trim(),
      contactPerson: newHospital.contactPerson.trim() || undefined,
      phone: newHospital.phone.trim() || undefined,
      valley: newHospital.valley,
    });

    setNewHospital({
      name: '',
      location: '',
      contactPerson: '',
      phone: '',
      valley: 'inside_valley',
    });
    setIsAddDialogOpen(false);
  };

  type EnrichedHospital = HospitalOption & {
    contactPerson: string;
    phone: string;
    bloodInventory: Record<(typeof bloodTypes)[number], number>;
  };

  const rawHospitals = apiHospitalsData?.items ?? [];

  const hospitals = rawHospitals.map((hospital) => ({
    ...hospital,
    contactPerson: hospital.contactPerson ?? 'Not provided',
    phone: hospital.phone ?? 'Not provided',
    bloodInventory: { ...emptyBloodInventory },
  })) as EnrichedHospital[];
  const paginationMeta = apiHospitalsData?.meta;

  // Calculate total inventory across all hospitals
  const totalInventory = hospitals.reduce<Record<(typeof bloodTypes)[number], number>>((acc, hospital) => {
    bloodTypes.forEach((type) => {
      acc[type] = (acc[type] || 0) + (hospital.bloodInventory[type] ?? 0);
    });
    return acc;
  }, { 'O+': 0, 'O-': 0, 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0 });

  if (isHospitalsLoading) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Loading hospitals...</p>
        </CardContent>
      </Card>
    );
  }

  if (isHospitalsError) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="py-12 text-center text-destructive">
          <p>Failed to load hospitals.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Hospitals & Blood Banks</h1>
          <p className="mt-1 text-muted-foreground">
            Monitor blood inventory levels across partner hospitals
          </p>
        </div>

        <Button onClick={() => setIsAddDialogOpen(true)} className="sm:self-start">
          <Plus className="mr-2 h-4 w-4" />
          Add Hospital
        </Button>
      </div>

      {/* Search */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search hospitals by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="w-48">
                <Select
                  value={valleyFilter}
                  onValueChange={(v) => setValleyFilter(v as typeof valleyFilter)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="inside_valley">Inside Valley</SelectItem>
                    <SelectItem value="outside_valley">Outside Valley</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
        </CardContent>
      </Card>

      {/* Total inventory overview */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Droplet className="h-5 w-5 text-primary" />
            Total Blood Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
            {bloodTypes.map((type) => {
              const units = totalInventory[type] || 0;
              const stockLevel = getStockLevel(units);
              return (
                <div
                  key={type}
                  className="flex flex-col items-center p-3 rounded-lg border border-border bg-card"
                >
                  <span className="text-lg font-bold text-primary">{type}</span>
                  <span className="text-2xl font-semibold mt-1">{units}</span>
                  <span className={cn('text-xs mt-1', stockLevel.textColor)}>
                    {stockLevel.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hospital cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {hospitals.map((hospital) => {
          const totalUnits = Object.values(hospital.bloodInventory).reduce(
            (sum, val) => sum + val,
            0
          );
          const criticalTypes = bloodTypes.filter(
            (type) => hospital.bloodInventory[type] <= 2
          );

          return (
            <Card key={hospital.id} className="border-border shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{hospital.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {hospital.location}
                      </p>
                    </div>
                  </div>

                  {criticalTypes.length > 0 && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {criticalTypes.length} Critical
                    </Badge>
                  )}
                </div>

                {/* Contact */}
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {hospital.contactPerson}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {hospital.phone}
                  </span>
                </div>

                {/* Blood inventory grid */}
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {bloodTypes.map((type) => {
                    const units = hospital.bloodInventory[type];
                    const stockLevel = getStockLevel(units);
                    const maxUnits = 20;

                    return (
                      <div key={type} className="p-2 rounded border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{type}</span>
                          <span className={cn('text-xs', stockLevel.textColor)}>
                            {units}
                          </span>
                        </div>
                        <Progress
                          value={(units / maxUnits) * 100}
                          className="h-1.5"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Total and call button */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div>
                    <span className="text-sm text-muted-foreground">Total Inventory: </span>
                    <span className="font-semibold">{totalUnits} units</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`tel:${hospital.phone}`, '_self')}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {hospitals.length === 0 && (
        <Card className="border-border shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No hospitals found matching your search</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add Hospital</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hospital Name</label>
              <Input
                value={newHospital.name}
                onChange={(e) => setNewHospital((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Bir Hospital"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={newHospital.location}
                onChange={(e) => setNewHospital((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Kathmandu"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Valley</label>
              <Select
                value={newHospital.valley}
                onValueChange={(v) => setNewHospital((prev) => ({ ...prev, valley: v as 'inside_valley' | 'outside_valley' }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select valley" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inside_valley">Inside Valley</SelectItem>
                  <SelectItem value="outside_valley">Outside Valley</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Person</label>
                <Input
                  value={newHospital.contactPerson}
                  onChange={(e) =>
                    setNewHospital((prev) => ({ ...prev, contactPerson: e.target.value }))
                  }
                  placeholder="e.g. Dr. Sita Sharma"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={newHospital.phone}
                  onChange={(e) => setNewHospital((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. +977-1-4000000"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddHospital}
              disabled={
                createHospitalMutation.isPending ||
                !newHospital.name.trim() ||
                !newHospital.location.trim()
              }
            >
              {createHospitalMutation.isPending ? 'Adding...' : 'Add Hospital'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
