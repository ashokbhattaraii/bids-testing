'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { createDonorSchema, type CreateDonorFormValues, BLOOD_TYPES } from '@/schemas';
import { useUpdateDonor } from '@/hooks/use-donors';
import { useToast } from '@/hooks/use-toast';
import type { Donor } from '@/types';

interface EditDonorDialogProps {
  donor: Donor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDonorDialog({ donor, open, onOpenChange }: EditDonorDialogProps) {
  const { updateDonor, isUpdating } = useUpdateDonor();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateDonorFormValues>({
    resolver: zodResolver(createDonorSchema),
  });

  useEffect(() => {
    if (donor && open) {
      reset({
        name: donor.name,
        bloodType: donor.bloodType,
        phone: donor.phone,
        location: donor.location,
        rating: donor.rating,
        donationCount: donor.donationCount,
        status: donor.status,
        communicationType: donor.communicationType,
        notes: donor.notes ?? undefined,
        source: donor.source,
        category: donor.category,
        blacklistReason: donor.blacklistReason ?? undefined,
        lastDonation: donor.lastDonation ?? undefined,
        lastContacted: donor.lastContacted ?? undefined,
      });
    }
  }, [donor, open, reset]);

  const onSubmit = async (values: CreateDonorFormValues) => {
    if (!donor) return;
    try {
      await updateDonor({ id: donor.id, input: values });
      onOpenChange(false);
      toast({ title: 'Donor updated successfully' });
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Failed to update donor.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-130 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Donor</DialogTitle>
          <DialogDescription>Update donor information below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="py-4">
            {/* Name */}
            <Field>
              <FieldLabel htmlFor="edit-name">Full Name</FieldLabel>
              <Input id="edit-name" {...register('name')} placeholder="Full name" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              {/* Blood Type */}
              <Field>
                <FieldLabel htmlFor="edit-bloodType">Blood Type</FieldLabel>
                <Select
                  defaultValue={donor?.bloodType}
                  onValueChange={(v) =>
                    setValue('bloodType', v as CreateDonorFormValues['bloodType'], { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map((bt) => (
                      <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bloodType && <p className="text-xs text-destructive mt-1">{errors.bloodType.message}</p>}
              </Field>

              {/* Location */}
              <Field>
                <FieldLabel htmlFor="edit-location">Location</FieldLabel>
                <Input id="edit-location" {...register('location')} placeholder="City/Area" />
                {errors.location && <p className="text-xs text-destructive mt-1">{errors.location.message}</p>}
              </Field>
            </div>

            {/* Phone */}
            <Field>
              <FieldLabel htmlFor="edit-phone">Phone Number</FieldLabel>
              <Input id="edit-phone" type="tel" {...register('phone')} placeholder="+977-98..." />
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              {/* Rating */}
              <Field>
                <FieldLabel htmlFor="edit-rating">Rating (0–5)</FieldLabel>
                <Input
                  id="edit-rating"
                  type="number"
                  min={0}
                  max={5}
                  step={0.5}
                  {...register('rating', { valueAsNumber: true })}
                />
                {errors.rating && <p className="text-xs text-destructive mt-1">{errors.rating.message}</p>}
              </Field>

              {/* Donation Count */}
              <Field>
                <FieldLabel htmlFor="edit-donationCount">Donation Count</FieldLabel>
                <Input
                  id="edit-donationCount"
                  type="number"
                  min={0}
                  {...register('donationCount', { valueAsNumber: true })}
                />
                {errors.donationCount && <p className="text-xs text-destructive mt-1">{errors.donationCount.message}</p>}
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Last Donation */}
              <Field>
                <FieldLabel htmlFor="edit-lastDonation">Last Donation</FieldLabel>
                <Input id="edit-lastDonation" type="date" {...register('lastDonation')} />
              </Field>

              {/* Last Contacted */}
              <Field>
                <FieldLabel htmlFor="edit-lastContacted">Last Contacted</FieldLabel>
                <Input id="edit-lastContacted" type="date" {...register('lastContacted')} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select
                  defaultValue={donor?.status}
                  onValueChange={(v) =>
                    setValue('status', v as CreateDonorFormValues['status'], { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pledged">Pledged</SelectItem>
                    <SelectItem value="dormant">Dormant</SelectItem>
                    <SelectItem value="do_not_call">Do Not Call</SelectItem>
                    <SelectItem value="blacklisted">Blacklisted</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* Communication Type */}
              <Field>
                <FieldLabel>Communication</FieldLabel>
                <Select
                  defaultValue={donor?.communicationType}
                  onValueChange={(v) =>
                    setValue('communicationType', v as CreateDonorFormValues['communicationType'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone_call">Phone Call</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Source */}
              <Field>
                <FieldLabel>Source</FieldLabel>
                <Select
                  defaultValue={donor?.source}
                  onValueChange={(v) =>
                    setValue('source', v as CreateDonorFormValues['source'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="pledged">Pledged</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="walk_in">Walk-in</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* Category */}
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Select
                  defaultValue={donor?.category}
                  onValueChange={(v) =>
                    setValue('category', v as CreateDonorFormValues['category'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pledged">Pledged</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Notes */}
            <Field>
              <FieldLabel htmlFor="edit-notes">Notes / Remarks</FieldLabel>
              <Textarea
                id="edit-notes"
                rows={3}
                {...register('notes')}
                placeholder="Any notes about the donor..."
                className="resize-none"
              />
            </Field>

            {/* Blacklist Reason */}
            <Field>
              <FieldLabel htmlFor="edit-blacklistReason">Blacklist Reason</FieldLabel>
              <Input
                id="edit-blacklistReason"
                {...register('blacklistReason')}
                placeholder="Only if blacklisted"
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
