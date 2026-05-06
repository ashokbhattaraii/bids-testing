import { z } from 'zod';

// ── Shared enums ──────────────────────────────────────────────────────────────
export const BloodTypeSchema = z.enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']);
export const UrgencySchema = z.enum(['normal', 'urgent', 'critical']);
export const RequestStatusSchema = z.enum(['pending', 'in_progress', 'fulfilled', 'cancelled']);
export const DonorStatusSchema = z.enum(['available', 'unavailable', 'blacklisted']);
export const PledgeStatusSchema = z.enum(['new', 'contacted', 'converted']);
export const FeedbackTypeSchema = z.enum(['patient', 'donor']);
export const FeedbackStatusSchema = z.enum(['new', 'reviewed', 'resolved']);
export const UserRoleSchema = z.enum(['admin', 'call_operator', 'volunteer']);
export const UnverifiedSourceSchema = z.enum(['Online Form', 'Walk-in', 'Referral', 'Campaign']);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const SeedAdminSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

// ── Blood Requests ─────────────────────────────────────────────────────────────
export const CreateRequestSchema = z.object({
  patientName: z.string().min(1),
  hospitalId: z.string().optional(),
  hospitalName: z.string().min(1),
  bloodType: BloodTypeSchema,
  quantity: z.number().int().positive(),
  urgency: UrgencySchema.default('normal'),
  status: RequestStatusSchema.default('pending'),
  diagnosis: z.string().optional(),
  bloodComponents: z.array(z.string()).optional(),
  neededBy: z.string().optional(),
  notes: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  location: z.enum(['inside_valley', 'outside_valley']).default('inside_valley'),
});

export const UpdateRequestSchema = CreateRequestSchema.partial();

// ── Donors ────────────────────────────────────────────────────────────────────
export const CreateDonorSchema = z.object({
  name: z.string().min(1),
  bloodType: BloodTypeSchema,
  phone: z.string().min(1),
  location: z.string().min(1),
  lastDonation: z.string().optional(),
  rating: z.number().min(0).max(5).default(5),
  status: DonorStatusSchema.default('available'),
});

export const UpdateDonorSchema = CreateDonorSchema.partial();

export const BlacklistDonorSchema = z.object({
  reason: z.string().min(1),
});

// ── Pledges ───────────────────────────────────────────────────────────────────
export const CreatePledgeSchema = z.object({
  name: z.string().min(1),
  bloodType: BloodTypeSchema,
  phone: z.string().min(1),
  address: z.string().optional(),
  pledgeDate: z.string().optional(),
  hotlineAgent: z.string().optional(),
  status: PledgeStatusSchema.default('new'),
  notes: z.string().optional(),
});

export const UpdatePledgeSchema = CreatePledgeSchema.partial();

// ── Hospitals ─────────────────────────────────────────────────────────────────
export const CreateHospitalSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
});

export const UpdateHospitalSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  bloodInventory: z.record(BloodTypeSchema, z.number().int().min(0)).optional(),
});

// ── Feedback ──────────────────────────────────────────────────────────────────
export const CreateFeedbackSchema = z.object({
  type: FeedbackTypeSchema,
  name: z.string().min(1),
  message: z.string().min(1),
  rating: z.number().int().min(1).max(5).optional(),
});

export const UpdateFeedbackSchema = z.object({
  status: FeedbackStatusSchema,
});

// ── Users ─────────────────────────────────────────────────────────────────────
export const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: UserRoleSchema.default('volunteer'),
  isActive: z.boolean().default(true),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: UserRoleSchema.optional(),
  isActive: z.boolean().optional(),
  avatar: z.string().optional(),
});

// ── Unverified Donors ─────────────────────────────────────────────────────────
export const CreateUnverifiedDonorSchema = z.object({
  name: z.string().min(1),
  bloodType: BloodTypeSchema,
  phone: z.string().min(1),
  address: z.string().optional(),
  source: UnverifiedSourceSchema.default('Online Form'),
});

// ── Type exports ──────────────────────────────────────────────────────────────
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateRequestInput = z.infer<typeof CreateRequestSchema>;
export type CreateDonorInput = z.infer<typeof CreateDonorSchema>;
export type CreatePledgeInput = z.infer<typeof CreatePledgeSchema>;
export type CreateHospitalInput = z.infer<typeof CreateHospitalSchema>;
export type CreateFeedbackInput = z.infer<typeof CreateFeedbackSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type CreateUnverifiedDonorInput = z.infer<typeof CreateUnverifiedDonorSchema>;
