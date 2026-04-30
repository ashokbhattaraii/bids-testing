'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Phone,
  Star,
  MoreVertical,
  CheckCircle,
  XCircle,
  Ban,
  Edit,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBloodBank } from '@/lib/blood-bank-context';
import { getStatusColor } from '@/lib/dummy-data';
import type { Donor } from '@/lib/dummy-data';

interface DonorGridProps {
  donors: Donor[];
}

export function DonorGrid({ donors }: DonorGridProps) {
  const { updateDonor } = useBloodBank();

  const formatLastDonation = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 60) return '1 month ago';
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const isEligible = (lastDonation: string) => {
    const date = new Date(lastDonation);
    const daysSince = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince >= 56;
  };

  const handleStatusChange = (id: string, status: Donor['status'], reason?: string) => {
    updateDonor(id, {
      status,
      blacklistReason: status === 'blacklisted' ? reason : undefined,
    });
  };

  if (donors.length === 0) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>No donors found matching your criteria</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Blood Type</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold text-center">Donations</TableHead>
              <TableHead className="font-semibold text-center">Rating</TableHead>
              <TableHead className="font-semibold">Last Donation</TableHead>
              <TableHead className="font-semibold">Eligibility</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donors.map((donor) => (
              <TableRow
                key={donor.id}
                className={cn(
                  'hover:bg-muted/30 transition-colors',
                  donor.status === 'blacklisted' && 'opacity-60 bg-red-50/30'
                )}
              >
                {/* Name */}
                <TableCell className="font-medium">{donor.name}</TableCell>

                {/* Blood Type */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-primary/5 text-primary border-primary/20 font-semibold"
                  >
                    {donor.bloodType}
                  </Badge>
                </TableCell>

                {/* Phone */}
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => window.open(`tel:${donor.phone}`, '_self')}
                  >
                    <Phone className="h-3 w-3" />
                    {donor.phone}
                  </Button>
                </TableCell>

                {/* Location */}
                <TableCell className="text-muted-foreground">{donor.location}</TableCell>

                {/* Donations */}
                <TableCell className="text-center font-medium">{donor.donationCount}</TableCell>

                {/* Rating */}
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="font-medium">{donor.rating.toFixed(1)}</span>
                  </div>
                </TableCell>

                {/* Last Donation */}
                <TableCell className="text-muted-foreground">
                  {formatLastDonation(donor.lastDonation)}
                </TableCell>

                {/* Eligibility */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      isEligible(donor.lastDonation)
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-amber-100 text-amber-700 border-amber-200'
                    )}
                  >
                    {isEligible(donor.lastDonation) ? 'Eligible' : 'Not Eligible'}
                  </Badge>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn('text-xs capitalize', getStatusColor(donor.status))}
                  >
                    {donor.status}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(donor.id, 'available')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Available
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(donor.id, 'unavailable')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Mark Unavailable
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(donor.id, 'blacklisted', 'Manual blacklist')
                        }
                        className="text-destructive"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Blacklist Donor
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
