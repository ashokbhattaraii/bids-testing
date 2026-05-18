'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { createDonorSchema, type CreateDonorFormValues, BLOOD_TYPES } from '@/schemas';
import { useCreateDonor } from '@/queries/donors';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

interface NewDonorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the newly created donor after a successful save */
  onCreated?: () => void;
}

export function NewDonorDialog({ open, onOpenChange, onCreated }: NewDonorDialogProps) {
  const { createDonor, isSubmitting } = useCreateDonor();
  const { toast } = useToast();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateDonorFormValues>({
    resolver: zodResolver(createDonorSchema),
    defaultValues: {
      rating: 0,
      donationCount: 0,
      status: 'unverified',
      communicationType: 'phone_call',
      source: 'direct',
      category: 'active',
    },
  });

  const onSubmit = async (values: CreateDonorFormValues) => {
    setSubmitError(null);
    try {
      await createDonor(values);
      reset();
      onOpenChange(false);
      toast({
        title: 'Donor added successfully',
        description: 'Donor registered as unverified. Visit Unverified Donors to review.',
        action: (
          <ToastAction altText="View unverified donors" onClick={() => router.push('/donors/unverified')}>
            View Unverified
          </ToastAction>
        ),
      });
      onCreated?.();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to add donor. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setSubmitError(null); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register New Donor</DialogTitle>
          <DialogDescription>
            Add a new blood donor to the database.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter donor's full name"
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="bloodType">Blood Type</FieldLabel>
                <Select
                  onValueChange={(v) =>
                    setValue('bloodType', v as CreateDonorFormValues['bloodType'], {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map((bt) => (
                      <SelectItem key={bt} value={bt}>
                        {bt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bloodType && (
                  <p className="text-xs text-destructive mt-1">{errors.bloodType.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="City/Area"
                />
                {errors.location && (
                  <p className="text-xs text-destructive mt-1">{errors.location.message}</p>
                )}
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+977-98..."
              />
              {errors.phone && (
                <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="rating">Rating (0–5)</FieldLabel>
              <Input
                id="rating"
                type="number"
                min={0}
                max={5}
                step={0.5}
                {...register('rating', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.rating && (
                <p className="text-xs text-destructive mt-1">{errors.rating.message}</p>
              )}
            </Field>
          </FieldGroup>

          {submitError && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 mb-2">
              {submitError}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Donor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

