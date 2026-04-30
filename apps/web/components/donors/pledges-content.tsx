'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Phone, MapPin, Calendar, Globe, UserPlus, Clock, CheckCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const pledges = [
  {
    id: 'PLG001',
    name: 'Suresh Tamang',
    bloodType: 'A+',
    phone: '9845555555',
    address: 'Baneshwor, Kathmandu',
    pledgeDate: '2024-03-18T10:30:00',
    hotlineAgent: 'Operator 1',
    status: 'new',
    notes: 'Available for donation next week',
  },
  {
    id: 'PLG002',
    name: 'Maya Rai',
    bloodType: 'O+',
    phone: '9846666666',
    address: 'Jorpati, Kathmandu',
    pledgeDate: '2024-03-17T14:15:00',
    hotlineAgent: 'Operator 2',
    status: 'contacted',
    notes: 'Will come to center on Monday',
  },
  {
    id: 'PLG003',
    name: 'Dipak Thapa',
    bloodType: 'B-',
    phone: '9847777777',
    address: 'Balaju, Kathmandu',
    pledgeDate: '2024-03-16T09:45:00',
    hotlineAgent: 'Operator 1',
    status: 'converted',
    notes: 'Converted to verified donor',
  },
  {
    id: 'PLG004',
    name: 'Sunita Maharjan',
    bloodType: 'AB+',
    phone: '9848888888',
    address: 'Kirtipur, Kathmandu',
    pledgeDate: '2024-03-15T16:00:00',
    hotlineAgent: 'Operator 3',
    status: 'new',
    notes: 'First time donor',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'new':
      return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">New Pledge</Badge>;
    case 'contacted':
      return <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">Contacted</Badge>;
    case 'converted':
      return <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">Converted</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function PledgesContent() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPledges = pledges.filter(pledge =>
    pledge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pledge.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pledge.phone.includes(searchQuery)
  );

  const newPledges = pledges.filter(p => p.status === 'new').length;
  const contactedPledges = pledges.filter(p => p.status === 'contacted').length;
  const convertedPledges = pledges.filter(p => p.status === 'converted').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pledges From Hotline</h1>
          <p className="text-muted-foreground">Manage pledges received through the blood donation hotline</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pledges.length}</p>
                <p className="text-sm text-muted-foreground">Total Pledges</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{newPledges}</p>
                <p className="text-sm text-muted-foreground">New Pledges</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Phone className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{contactedPledges}</p>
                <p className="text-sm text-muted-foreground">Contacted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{convertedPledges}</p>
                <p className="text-sm text-muted-foreground">Converted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Hotline Pledges</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search pledges..."
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
                <TableHead>Pledge Date</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPledges.map((pledge) => (
                <TableRow key={pledge.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                        <span className="text-sm font-medium text-accent-foreground">
                          {pledge.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{pledge.name}</p>
                        <p className="text-xs text-muted-foreground">{pledge.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {pledge.bloodType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {pledge.phone}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {pledge.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(pledge.pledgeDate).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{pledge.hotlineAgent}</TableCell>
                  <TableCell>{getStatusBadge(pledge.status)}</TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground max-w-[150px] truncate" title={pledge.notes}>
                      {pledge.notes}
                    </p>
                  </TableCell>
                  <TableCell>
                    {pledge.status !== 'converted' && (
                      <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-600 hover:bg-emerald-50">
                        <UserPlus className="h-4 w-4 mr-1" />
                        Convert
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
