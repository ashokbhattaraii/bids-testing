'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Ban, UserCheck, Phone, MapPin, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const blockedDonors = [
  {
    id: 'BD001',
    name: 'Ram Bahadur',
    bloodType: 'A+',
    phone: '9841234567',
    address: 'Kathmandu',
    reason: 'Medical Condition',
    blockedDate: '2024-01-15',
    blockedBy: 'Dr. Sharma',
  },
  {
    id: 'BD002',
    name: 'Sita Devi',
    bloodType: 'B-',
    phone: '9851234567',
    address: 'Lalitpur',
    reason: 'Repeated No-show',
    blockedDate: '2024-02-20',
    blockedBy: 'Admin',
  },
  {
    id: 'BD003',
    name: 'Hari Prasad',
    bloodType: 'O+',
    phone: '9861234567',
    address: 'Bhaktapur',
    reason: 'Low Hemoglobin',
    blockedDate: '2024-03-10',
    blockedBy: 'Dr. Thapa',
  },
];

export function BlockedDonorsContent() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDonors = blockedDonors.filter(donor =>
    donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donor.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donor.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Blood Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Block Reason</TableHead>
                <TableHead>Blocked Date</TableHead>
                <TableHead>Blocked By</TableHead>
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
                        {donor.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                      {donor.reason}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(donor.blockedDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{donor.blockedBy}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-600 hover:bg-emerald-50">
                      <UserCheck className="h-4 w-4 mr-1" />
                      Unblock
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredDonors.length === 0 && (
            <div className="text-center py-12">
              <Ban className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No blocked donors found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
