'use client';

import { useState } from 'react';
import { useBloodBank } from '@/lib/blood-bank-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  MapPin,
  Phone,
  User,
  Search,
  Droplet,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as const;

const getStockLevel = (units: number) => {
  if (units === 0) return { label: 'Out', color: 'bg-red-500', textColor: 'text-red-700' };
  if (units <= 2) return { label: 'Critical', color: 'bg-red-500', textColor: 'text-red-700' };
  if (units <= 5) return { label: 'Low', color: 'bg-amber-500', textColor: 'text-amber-700' };
  if (units <= 10) return { label: 'Moderate', color: 'bg-blue-500', textColor: 'text-blue-700' };
  return { label: 'Good', color: 'bg-emerald-500', textColor: 'text-emerald-700' };
};

export function HospitalsContent() {
  const { hospitals } = useBloodBank();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHospitals = hospitals.filter((hospital) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      hospital.name.toLowerCase().includes(searchLower) ||
      hospital.location.toLowerCase().includes(searchLower)
    );
  });

  // Calculate total inventory across all hospitals
  const totalInventory = hospitals.reduce((acc, hospital) => {
    bloodTypes.forEach((type) => {
      acc[type] = (acc[type] || 0) + hospital.bloodInventory[type];
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Hospitals & Blood Banks</h1>
        <p className="text-muted-foreground mt-1">
          Monitor blood inventory levels across partner hospitals
        </p>
      </div>

      {/* Search */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search hospitals by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
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
        {filteredHospitals.map((hospital) => {
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

      {filteredHospitals.length === 0 && (
        <Card className="border-border shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No hospitals found matching your search</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
