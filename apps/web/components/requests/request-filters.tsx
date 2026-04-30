'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DualDatePicker } from '@/components/ui/dual-date-picker';
import { Button } from '@/components/ui/button';
import { FieldLabel } from '@/components/ui/field';

interface RequestFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  urgencyFilter: string;
  onUrgencyChange: (value: string) => void;
  bloodTypeFilter: string;
  onBloodTypeChange: (value: string) => void;
  fromDate: string;
  onFromDateChange: (value: string) => void;
  toDate: string;
  onToDateChange: (value: string) => void;
}

export function RequestFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  urgencyFilter,
  onUrgencyChange,
  bloodTypeFilter,
  onBloodTypeChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
}: RequestFiltersProps) {
  const hasDateFilter = fromDate || toDate;

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by patient, hospital, blood type... (typo-tolerant)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />

            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={urgencyFilter} onValueChange={onUrgencyChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={bloodTypeFilter} onValueChange={onBloodTypeChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Blood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range Filter (BS/AD) */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 pt-3 border-t border-border">
          <div className="flex-1 min-w-[220px]">
            <FieldLabel className="text-xs text-muted-foreground mb-1.5 block">
              From Date
            </FieldLabel>
            <DualDatePicker value={fromDate} onChange={onFromDateChange} />
          </div>
          <div className="flex-1 min-w-[220px]">
            <FieldLabel className="text-xs text-muted-foreground mb-1.5 block">
              To Date
            </FieldLabel>
            <DualDatePicker value={toDate} onChange={onToDateChange} />
          </div>
          {hasDateFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onFromDateChange('');
                onToDateChange('');
              }}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear dates
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
