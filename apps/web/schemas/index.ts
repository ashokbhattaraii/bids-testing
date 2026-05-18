import { z } from 'zod';

const requiredString = (message: string) =>
  z.preprocess(
    (value) => (value == null ? '' : value),
    z.string().min(1, message)
  );

const requiredEnum = <T extends readonly [string, ...string[]]>(values: T, message: string) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value : ''),
    z.string()
      .min(1, message)
      .refine((value): value is T[number] => (values as readonly string[]).includes(value), {
        message,
      })
  );

const optionalString = (message: string) =>
  z.preprocess(
    (value) => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? undefined : trimmed;
      }
      return value;
    },
    z.string().min(1, message)
  ).optional();

const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as const;
const transportationOptions = ['yes', 'no', 'maybe'] as const;
const valleyOptions = ['inside_valley', 'outside_valley'] as const;

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
    .enum(['unverified', 'active', 'pledged', 'blacklisted', 'dormant', 'do_not_call'])
    .default('unverified'),
  blacklistReason: z.string().optional(),
  communicationType: z.enum(['phone_call', 'sms']).default('phone_call'),
  notes: z.string().optional(),
  source: z.enum(['direct', 'pledged', 'event', 'walk_in']).default('direct'),
  category: z.enum(['active', 'pledged', 'event']).default('active'),
});

export type CreateDonorFormValues = z.infer<typeof createDonorSchema>;

export const CreateHospitalSchema = z.object({
  name: requiredString('Hospital name is required'),
  location: requiredString('Hospital location is required'),
  contactPerson: optionalString('Contact person is required'),
  phone: optionalString('Phone number is required'),
  valley: z.enum(valleyOptions).optional(),
});

export type CreateHospitalInput = z.infer<typeof CreateHospitalSchema>;

export const RequestSchema = z.object({
  id: z.string(),
  patientName: requiredString('Patient name is required'),
  requesterName: requiredString('Requester name is required'),
  requesterPhone: requiredString('Requester phone is required'),
  diagnosis: requiredString('Diagnosis is required'),
  hospitalId: z.string().optional(),
  hospital: requiredString('Hospital is required'),
  bloodType: requiredEnum(bloodGroups, 'Blood group is required'),
  // Accepts ISO date string (YYYY-MM-DD) from the dual date picker
  bloodRequiredOn: requiredString('Required-on date is required'),
  // total pints, coerce numeric strings to a number
  totalPints: z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().int().min(1, 'Total pints must be at least 1')),
  status: z.enum(['pending', 'in_progress', 'fulfilled', 'cancelled']).default('pending'),
  urgency: z.enum(['critical', 'high', 'moderate', 'low']).default('high'),
  transportationRequired: requiredEnum(transportationOptions, 'Transportation is required'),
  selectedComponents: z.array(z.string()).min(1, 'At least one blood component is required'),
  componentQuantities: z.preprocess(
    (value) => (value == null ? {} : value),
    z.record(z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().int().min(1, 'Component quantity must be >= 1')))
  ),
  additionalNotes: z.string().optional(),
  images: z.array(z.object({ name: z.string().optional(), preview: z.string().optional() })).optional(),
  requestedAt: requiredString('Requested at is required'),
  neededBy: requiredString('Needed by is required'),
  location: z.enum(['inside_valley', 'outside_valley']),
});

export type Request = z.infer<typeof RequestSchema>;

// Schema for creating a request from frontend forms / API clients
export const CreateRequestSchema = RequestSchema.omit({ id: true });
export type CreateRequestInput = z.infer<typeof CreateRequestSchema>;
