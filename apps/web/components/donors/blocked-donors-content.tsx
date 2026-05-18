'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Ban, UserCheck, Phone, MapPin, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDonors } from '@/queries/donors';
import { donorService } from '@/services';

export function BlockedDonorsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [unblocking, setUnblocking] = useState<string | null>(null);

  const { donors, isLoading, error, refetch } = useDonors({ status: 'blacklisted' });

  const filteredDonors = donors.filter(
    (donor) =>
      donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (donor.blacklistReason ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleUnblock = async (id: string) => {
    setUnblocking(id);
    try {
      await donorService.unblacklist(id);
      refetch();
    } finally {
      setUnblocking(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blocked Donors</h1>
          <p className="text-muted-foreground">Manage donors who are temporarily or permanently blocked</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Blocked Donors List</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search blocked donors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-sm text-destructive text-center py-4">{error}</p>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Block Reason</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonors.map((donor) => (
                    <TableRow key={donor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                            <Ban className="h-5 w-5 text-destructive" />
                          </div>
                          <div>
                            <p className="font-medium">{donor.name}</p>
                            <p className="text-xs text-muted-foreground">{donor.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {donor.bloodType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {donor.phone}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {donor.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {donor.blacklistReason ? (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                            {donor.blacklistReason}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                          disabled={unblocking === donor.id}
                          onClick={() => handleUnblock(donor.id)}
                        >
                          {unblocking === donor.id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <UserCheck className="h-4 w-4 mr-1" />
                          )}
                          Unblock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredDonors.length === 0 && !error && (
                <div className="text-center py-12">
                  <Ban className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No blocked donors found</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
