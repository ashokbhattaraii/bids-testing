import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export type User = z.infer<typeof UserSchema>;

export const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as const;

export const createDonorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bloodType: z.enum(BLOOD_TYPES, { required_error: 'Blood type is required' }),
  phone: z.string().min(1, 'Phone is required'),
  location: z.string().min(1, 'Location is required'),
  rating: z.coerce.number().min(0).max(5).default(0),
  lastDonation: z.string().optional(),
  lastContacted: z.string().optional(),
  donationCount: z.coerce.number().int().min(0).default(0),
  status: z
    .enum(['active', 'pledged', 'blacklisted', 'dormant', 'do_not_call'])
    .default('active'),
  blacklistReason: z.string().optional(),
  communicationType: z.enum(['phone_call', 'sms']).default('phone_call'),
  notes: z.string().optional(),
  source: z.enum(['direct', 'pledged', 'event', 'walk_in']).default('direct'),
  category: z.enum(['active', 'pledged', 'event']).default('active'),
});

export type CreateDonorFormValues = z.infer<typeof createDonorSchema>;
