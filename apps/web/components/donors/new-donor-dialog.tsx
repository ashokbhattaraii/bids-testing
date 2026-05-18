'use client';

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
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { createDonorSchema, type CreateDonorFormValues, BLOOD_TYPES } from '@/schemas';
import { useCreateDonor } from '@/hooks/use-donors';

interface NewDonorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the newly created donor after a successful save */
  onCreated?: () => void;
}

export function NewDonorDialog({ open, onOpenChange, onCreated }: NewDonorDialogProps) {
  const { createDonor, isSubmitting } = useCreateDonor();

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
    await createDonor(values);
    reset();
    onOpenChange(false);
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

