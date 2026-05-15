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

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export type User = z.infer<typeof UserSchema>;

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
