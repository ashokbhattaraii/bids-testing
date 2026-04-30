'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Lightbulb,
  Phone,
  Star,
  MapPin,
  Calendar,
  Droplet,
  UserCheck,
} from 'lucide-react';
import { useBloodBank } from '@/lib/blood-bank-context';
import type { Request, Donor } from '@/lib/dummy-data';

interface IntelligencePanelProps {
  selectedRequest: Request | null;
}

// Blood type compatibility chart
const bloodCompatibility: Record<string, string[]> = {
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
};

export function IntelligencePanel({ selectedRequest }: IntelligencePanelProps) {
  const { donors } = useBloodBank();

  // Find compatible donors
  const suggestedDonors = useMemo(() => {
    if (!selectedRequest) return [];

    const compatibleTypes = bloodCompatibility[selectedRequest.bloodType] || [];
    
    return donors
      .filter((donor) => {
        // Must have compatible blood type
        if (!compatibleTypes.includes(donor.bloodType)) return false;
        
        // Must be available (not blacklisted or unavailable)
        if (donor.status !== 'available') return false;
        
        // Check last donation date (at least 56 days ago)
        const lastDonation = new Date(donor.lastDonation);
        const daysSinceLastDonation = Math.floor(
          (Date.now() - lastDonation.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastDonation < 56) return false;
        
        return true;
      })
      .sort((a, b) => {
        // Prioritize by rating, then by donation count
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.donationCount - a.donationCount;
      })
      .slice(0, 5);
  }, [selectedRequest, donors]);

  const formatLastDonation = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 60) return '1 month ago';
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (!selectedRequest) {
    return (
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Intelligence Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Select a request to see donor suggestions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Donor Suggestions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Compatible donors for {selectedRequest.bloodType} ({selectedRequest.quantity} units)
        </p>
      </CardHeader>
      <CardContent>
        {suggestedDonors.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Droplet className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No eligible donors found</p>
            <p className="text-xs mt-1">
              Compatible types: {bloodCompatibility[selectedRequest.bloodType]?.join(', ')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestedDonors.map((donor, index) => (
              <div
                key={donor.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {donor.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {index === 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-amber-500"
                    >
                      <Star className="h-3 w-3 text-white" />
                    </Badge>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground text-sm">
                      {donor.name}
                    </h4>
                    <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                      {donor.bloodType}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500" />
                      {donor.rating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplet className="h-3 w-3" />
                      {donor.donationCount} donations
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {donor.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatLastDonation(donor.lastDonation)}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 h-7 text-xs w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`tel:${donor.phone}`, '_self');
                    }}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call {donor.phone}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
