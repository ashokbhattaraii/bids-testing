'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FollowUp {
  id: string;
  type: 'donor_callback' | 'hospital_update' | 'patient_check';
  title: string;
  description: string;
  dueTime: string;
  priority: 'high' | 'medium' | 'low';
  location: string;
  phone?: string;
}

const followUps: FollowUp[] = [
  {
    id: '1',
    type: 'donor_callback',
    title: 'Call Prakash Sharma',
    description: 'Confirm availability for O+ donation',
    dueTime: '10:30 AM',
    priority: 'high',
    location: 'Kathmandu',
    phone: '+977-9841234567',
  },
  {
    id: '2',
    type: 'hospital_update',
    title: 'Update Bir Hospital',
    description: 'Blood delivery status for REQ005',
    dueTime: '11:00 AM',
    priority: 'high',
    location: 'Kaisermahal',
    phone: '+977-1-4414775',
  },
  {
    id: '3',
    type: 'patient_check',
    title: 'Check on Ramesh Sharma',
    description: 'Post-transfusion follow-up',
    dueTime: '2:00 PM',
    priority: 'medium',
    location: 'Kathmandu Medical',
  },
  {
    id: '4',
    type: 'donor_callback',
    title: 'Call Deepa Niroula',
    description: 'Schedule next donation date',
    dueTime: '3:30 PM',
    priority: 'low',
    location: 'Kathmandu',
    phone: '+977-9846789012',
  },
];

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'low':
      return 'bg-accent text-accent-foreground border-accent';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export function FollowUpPanel() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const markComplete = (id: string) => {
    setCompletedIds((prev) => new Set([...prev, id]));
  };

  const activeFollowUps = followUps.filter((f) => !completedIds.has(f.id));
  const completedFollowUps = followUps.filter((f) => completedIds.has(f.id));

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Follow-up Reminders
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {activeFollowUps.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-4 w-full justify-start bg-muted/50">
            <TabsTrigger value="pending" className="text-sm">
              Pending ({activeFollowUps.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-sm">
              Completed ({completedFollowUps.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3 mt-0">
            {activeFollowUps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                <p>All follow-ups completed!</p>
              </div>
            ) : (
              activeFollowUps.map((followUp) => (
                <div
                  key={followUp.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors"
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      followUp.priority === 'high'
                        ? 'bg-primary/10'
                        : followUp.priority === 'medium'
                        ? 'bg-amber-100'
                        : 'bg-accent'
                    )}
                  >
                    {followUp.type === 'donor_callback' ? (
                      <Phone
                        className={cn(
                          'h-5 w-5',
                          followUp.priority === 'high'
                            ? 'text-primary'
                            : followUp.priority === 'medium'
                            ? 'text-amber-600'
                            : 'text-secondary'
                        )}
                      />
                    ) : followUp.type === 'hospital_update' ? (
                      <AlertCircle
                        className={cn(
                          'h-5 w-5',
                          followUp.priority === 'high'
                            ? 'text-primary'
                            : followUp.priority === 'medium'
                            ? 'text-amber-600'
                            : 'text-secondary'
                        )}
                      />
                    ) : (
                      <Calendar
                        className={cn(
                          'h-5 w-5',
                          followUp.priority === 'high'
                            ? 'text-primary'
                            : followUp.priority === 'medium'
                            ? 'text-amber-600'
                            : 'text-secondary'
                        )}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-foreground">
                          {followUp.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {followUp.description}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'shrink-0 text-xs',
                          getPriorityStyles(followUp.priority)
                        )}
                      >
                        {followUp.priority}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {followUp.dueTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {followUp.location}
                      </span>
                      {followUp.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {followUp.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => markComplete(followUp.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Done
                  </Button>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-0">
            {completedFollowUps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No completed follow-ups yet</p>
              </div>
            ) : (
              completedFollowUps.map((followUp) => (
                <div
                  key={followUp.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/30 opacity-60"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground line-through">
                      {followUp.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {followUp.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
