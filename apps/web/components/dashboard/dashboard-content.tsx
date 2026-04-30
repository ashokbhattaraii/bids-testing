'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useBloodBank } from '@/lib/blood-bank-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Droplet,
  Clock,
  AlertTriangle,
  Users,
  Activity,
  Building2,
  FileText,
  Bell,
  CheckCircle2,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUrgencyColor, getStatusColor } from '@/lib/dummy-data';
import Link from 'next/link';

export function DashboardContent() {
  const { user } = useAuth();
  const { requests, donors } = useBloodBank();
  const [showReminders, setShowReminders] = useState(true);
  const [valleyTab, setValleyTab] = useState<'inside' | 'outside'>('inside');

  // Calculate stats
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const inProgressRequests = requests.filter((r) => r.status === 'in_progress').length;
  const criticalRequests = requests.filter((r) => r.urgency === 'critical').length;
  const activeDonors = donors.filter((d) => d.status === 'available').length;

  // Filter requests by valley (using hospital location as proxy)
  const valleyKeywords = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Bir Hospital', 'Grande', 'Nepal Medical'];
  
  const insideValleyRequests = requests.filter((r) =>
    valleyKeywords.some((keyword) => r.hospital.toLowerCase().includes(keyword.toLowerCase()))
  );
  const outsideValleyRequests = requests.filter(
    (r) => !valleyKeywords.some((keyword) => r.hospital.toLowerCase().includes(keyword.toLowerCase()))
  );

  // Simulated follow-up reminders (managed blood requests needing follow-up after 1-2 hours)
  const followUpReminders = requests
    .filter((r) => r.status === 'fulfilled')
    .slice(0, 4)
    .map((r) => ({
      ...r,
      reminderType: 'collection_check' as const,
      timeAgo: '1 hour ago',
    }));

  return (
    <div className="space-y-6">
      {/* Header with Quick Access Icons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-muted-foreground">
            Blood Information Dispatch System
          </p>
        </div>

        {/* Quick Access Icons - Hospital List and Reports only */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/hospitals">
            <Button variant="outline" size="sm" className="gap-2 border-accent hover:bg-accent/20">
              <Building2 className="h-4 w-4 text-secondary" />
              <span className="hidden sm:inline">Hospital List</span>
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline" size="sm" className="gap-2 border-accent hover:bg-accent/20">
              <FileText className="h-4 w-4 text-secondary" />
              <span className="hidden sm:inline">Reports</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card className="border-l-4 border-l-secondary shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{totalRequests}</p>
              </div>
              <Droplet className="h-8 w-8 text-secondary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingRequests}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{inProgressRequests}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold">{criticalRequests}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Donors</p>
                <p className="text-2xl font-bold">{activeDonors}</p>
              </div>
              <Users className="h-8 w-8 text-emerald-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Follow-up Reminders + Valley Tabs */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Follow-up Reminders Panel - Recently Managed Blood */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4 text-primary" />
                Follow-up Reminders
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {showReminders ? 'On' : 'Off'}
                </span>
                <Switch
                  checked={showReminders}
                  onCheckedChange={setShowReminders}
                  className="scale-75"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Check if blood was collected (after 1-2 hrs)
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {showReminders ? (
              followUpReminders.length > 0 ? (
                followUpReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {reminder.patientName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {reminder.hospital}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs px-1.5 py-0 font-mono">
                          {reminder.bloodType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {reminder.timeAgo}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Collected
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No pending follow-ups
                </div>
              )
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Reminders are turned off
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inside/Outside Valley Tabs */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-secondary" />
                Blood Banks & Hospital Requests
              </CardTitle>
              <Link href="/requests">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary">
                  View All <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={valleyTab} onValueChange={(v) => setValleyTab(v as 'inside' | 'outside')}>
              <TabsList className="mb-4 w-full grid grid-cols-2">
                <TabsTrigger value="inside" className="gap-2">
                  Inside Valley
                  <Badge variant="secondary" className="ml-1 text-xs bg-accent text-secondary">
                    {insideValleyRequests.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="outside" className="gap-2">
                  Outside Valley
                  <Badge variant="secondary" className="ml-1 text-xs bg-accent text-secondary">
                    {outsideValleyRequests.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="inside" className="mt-0">
                <RequestList requests={insideValleyRequests.slice(0, 5)} />
              </TabsContent>

              <TabsContent value="outside" className="mt-0">
                <RequestList requests={outsideValleyRequests.slice(0, 5)} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper component for request list in valley tabs
function RequestList({ requests }: { requests: Array<{
  id: string;
  patientName: string;
  hospital: string;
  bloodType: string;
  urgency: 'critical' | 'high' | 'moderate' | 'low';
  status: 'pending' | 'in_progress' | 'fulfilled' | 'cancelled';
}> }) {
  if (requests.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No requests in this area
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold font-mono',
                request.urgency === 'critical'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-secondary/10 text-secondary'
              )}
            >
              {request.bloodType}
            </div>
            <div>
              <p className="font-medium">{request.patientName}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {request.hospital}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn('text-xs capitalize', getUrgencyColor(request.urgency))}>
              {request.urgency}
            </Badge>
            <Badge className={cn('text-xs capitalize', getStatusColor(request.status))}>
              {request.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
