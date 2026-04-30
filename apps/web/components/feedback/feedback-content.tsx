'use client';

import { useState } from 'react';
import { useBloodBank } from '@/lib/blood-bank-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageSquare,
  User,
  Heart,
  Star,
  MoreVertical,
  CheckCircle,
  Eye,
  Clock,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Feedback } from '@/lib/dummy-data';

const getStatusColor = (status: Feedback['status']) => {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'reviewed':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'resolved':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export function FeedbackContent() {
  const { feedback, updateFeedback, addFeedback } = useBloodBank();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    name: '',
    type: 'patient' as 'patient' | 'donor',
    rating: 5,
    message: '',
  });

  const patientFeedback = feedback.filter((f) => f.type === 'patient');
  const donorFeedback = feedback.filter((f) => f.type === 'donor');

  const stats = {
    total: feedback.length,
    new: feedback.filter((f) => f.status === 'new').length,
    avgRating: feedback.length > 0 
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
      : '0',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleStatusChange = (id: string, status: Feedback['status']) => {
    updateFeedback(id, { status });
  };

  const handleAddFeedback = () => {
    if (!newFeedback.name || !newFeedback.message) return;
    
    addFeedback({
      name: newFeedback.name,
      type: newFeedback.type,
      rating: newFeedback.rating,
      message: newFeedback.message,
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    
    setNewFeedback({ name: '', type: 'patient', rating: 5, message: '' });
    setIsAddDialogOpen(false);
  };

  const renderFeedbackCard = (item: Feedback) => (
    <Card key={item.id} className="border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                item.type === 'patient' ? 'bg-blue-100' : 'bg-emerald-100'
              )}
            >
              {item.type === 'patient' ? (
                <User className="h-5 w-5 text-blue-600" />
              ) : (
                <Heart className="h-5 w-5 text-emerald-600" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                <Badge variant="outline" className={cn('text-xs', getStatusColor(item.status))}>
                  {item.status}
                </Badge>
              </div>

              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      i < item.rating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-muted-foreground'
                    )}
                  />
                ))}
              </div>

              <p className="text-sm text-foreground mt-2">{item.message}</p>

              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(item.createdAt)}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'reviewed')}>
                <Eye className="h-4 w-4 mr-2" />
                Mark as Reviewed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'resolved')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Resolved
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Feedback</h1>
          <p className="text-muted-foreground mt-1">
            View and manage feedback from patients and donors
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Feedback
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Feedback</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.new}</p>
              <p className="text-sm text-muted-foreground">New / Unreviewed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.avgRating}</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="patient" className="w-full">
        <TabsList className="mb-4 bg-muted/50">
          <TabsTrigger value="patient" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Patient Feedback
            <Badge variant="secondary" className="ml-1 text-xs">
              {patientFeedback.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="donor" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Donor Feedback
            <Badge variant="secondary" className="ml-1 text-xs">
              {donorFeedback.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patient" className="mt-0 space-y-4">
          {patientFeedback.length === 0 ? (
            <Card className="border-border shadow-sm">
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>No patient feedback yet</p>
              </CardContent>
            </Card>
          ) : (
            patientFeedback.map(renderFeedbackCard)
          )}
        </TabsContent>

        <TabsContent value="donor" className="mt-0 space-y-4">
          {donorFeedback.length === 0 ? (
            <Card className="border-border shadow-sm">
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>No donor feedback yet</p>
              </CardContent>
            </Card>
          ) : (
            donorFeedback.map(renderFeedbackCard)
          )}
        </TabsContent>
      </Tabs>

      {/* Add Feedback Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Enter name"
                value={newFeedback.name}
                onChange={(e) => setNewFeedback({ ...newFeedback, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={newFeedback.type}
                onValueChange={(value: 'patient' | 'donor') => 
                  setNewFeedback({ ...newFeedback, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="donor">Donor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewFeedback({ ...newFeedback, rating: star })}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={cn(
                        'h-6 w-6',
                        star <= newFeedback.rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-muted-foreground'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Enter feedback message"
                value={newFeedback.message}
                onChange={(e) => setNewFeedback({ ...newFeedback, message: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
                Close
              </Button>
              <Button 
                onClick={handleAddFeedback}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
