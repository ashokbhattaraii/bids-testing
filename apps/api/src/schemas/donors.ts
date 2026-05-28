import { createRoute, z } from '@hono/zod-openapi';
import { errorWrapper } from './common';

// ── Enums & Shared Schemas ───────────────────────────────────────────────────

export const bloodTypeSchema = z.enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']);

export const donorStatusSchema = z.enum([
  'unverified',
  'active',
  'pledged',
  'blacklisted',
  'dormant',
  'do_not_call',
]);

export const communicationTypeSchema = z.enum(['phone_call', 'sms']);

export const donorSourceSchema = z.enum(['direct', 'pledged', 'event', 'walk_in']);

export const donorCategorySchema = z.enum(['active', 'pledged', 'event']);

export const donorSchema = z.object({
  id: z.string().openapi({ example: 'dnr_01JZK8M8H6A4P2G9Q2R7S8T9V0' }),
  name: z.string().openapi({ example: 'Hari Prasad' }),
  bloodType: bloodTypeSchema.openapi({ example: 'O+' }),
  phone: z.string().openapi({ example: '9841000000' }),
  location: z.string().openapi({ example: 'Lalitpur' }),
  lastDonation: z.string().nullable().openapi({ example: '2026-05-01' }),
  lastContacted: z.string().nullable().openapi({ example: '2026-05-25' }),
  rating: z.number().openapi({ example: 4.5 }),
  donationCount: z.number().int().openapi({ example: 3 }),
  status: donorStatusSchema.openapi({ example: 'active' }),
  blacklistReason: z.string().nullable().openapi({ example: 'Requested to be removed' }),
  communicationType: communicationTypeSchema.openapi({ example: 'phone_call' }),
  notes: z.string().nullable().openapi({ example: 'Willing to donate' }),
  source: donorSourceSchema.openapi({ example: 'direct' }),
  category: donorCategorySchema.openapi({ example: 'active' }),
  createdAt: z.string().openapi({ example: '2026-05-28T09:00:00Z' }),
  updatedAt: z.string().openapi({ example: '2026-05-28T09:00:00Z' }),
});

export const createDonorSchema = z.object({
  name: z.string().min(1).openapi({ example: 'Hari Prasad', description: 'Donor name.' }),
  bloodType: bloodTypeSchema.openapi({ example: 'O+', description: 'Donor blood type.' }),
  phone: z.string().min(1).openapi({ example: '9841000000', description: 'Donor contact number.' }),
  location: z.string().min(1).openapi({ example: 'Lalitpur', description: 'Donor address/location.' }),
  lastDonation: z.string().optional().openapi({ example: '2026-05-01', description: 'Date of last donation.' }),
  lastContacted: z.string().optional().openapi({ example: '2026-05-25', description: 'Date of last contact.' }),
  rating: z.number().min(0).max(5).openapi({ example: 5, description: 'Donor rating.' }),
  donationCount: z.number().int().min(0).default(0).openapi({ example: 0, description: 'Initial donation count.' }),
  status: donorStatusSchema.default('unverified').openapi({ example: 'unverified', description: 'Initial donor status.' }),
  blacklistReason: z.string().optional().openapi({ example: 'DNC', description: 'Reason for blacklisting, if applicable.' }),
  communicationType: communicationTypeSchema.default('phone_call').openapi({ example: 'phone_call', description: 'Preferred communication mode.' }),
  notes: z.string().optional().openapi({ example: 'Willing to donate', description: 'Additional comments or notes.' }),
  source: donorSourceSchema.default('direct').openapi({ example: 'direct', description: 'Origin or source of donor data.' }),
  category: donorCategorySchema.default('active').openapi({ example: 'active', description: 'Classification of donor.' }),
});

export const updateDonorSchema = createDonorSchema.partial().openapi({
  description: 'Fields available to update a donor record.',
});

export const blacklistDonorSchema = z.object({
  reason: z.string().min(1).openapi({ example: 'DNC requested by donor', description: 'Reason for blacklisting.' }),
});

export const logContactSchema = z.object({
  communicationType: communicationTypeSchema.default('phone_call').openapi({ example: 'phone_call', description: 'Mode of contact.' }),
  requestId: z.string().optional().openapi({ example: 'req_01JZK8M8H6A4P2G9Q2R7S8T9V0', description: 'Associated request ID if applicable.' }),
  notes: z.string().optional().openapi({ example: 'Called donor, confirmed availability.', description: 'Notes about the conversation.' }),
});

// ── Response Schemas ─────────────────────────────────────────────────────────

export const listDonorsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(donorSchema),
    meta: z.object({
      total: z.number().openapi({ example: 100 }),
      page: z.number().openapi({ example: 1 }),
    }),
  }),
  message: z.string().optional(),
});

export const donorDetailResponseSchema = z.object({
  success: z.literal(true),
  data: donorSchema,
  message: z.string().optional(),
});

export const successNullResponseSchema = z.object({
  success: z.literal(true),
  data: z.any().nullable(),
  message: z.string().optional(),
});

export const importResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    inserted: z.number().openapi({ example: 10 }),
    failed: z.number().openapi({ example: 2 }),
    errors: z.array(z.string()).openapi({ example: ['Row 3: missing phone number'] }),
  }),
  message: z.string().optional(),
});

// ── Route Definitions ────────────────────────────────────────────────────────

export const listDonorsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Donors'],
  summary: 'List donors',
  description: 'Supports filters like blood type, status, source, search term, and sorting.',
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      status: z.enum(['all', 'unverified', 'active', 'pledged', 'blacklisted', 'dormant', 'do_not_call']).optional().default('all').openapi({ description: 'Filter by status' }),
      bloodType: z.enum(['all', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']).optional().default('all').openapi({ description: 'Filter by blood type' }),
      search: z.string().optional().default('').openapi({ description: 'Search term for name, phone, or location' }),
      sortBy: z.enum(['rating', 'donations', 'name', 'recent', 'last_contacted']).optional().default('recent').openapi({ description: 'Sort order' }),
      source: z.enum(['all', 'direct', 'pledged', 'event', 'walk_in']).optional().default('all').openapi({ description: 'Filter by source' }),
      page: z.string().optional().default('1').openapi({ description: 'Page number' }),
    }),
  },
  responses: {
    200: { description: 'Success', content: { 'application/json': { schema: listDonorsResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
  },
});

export const getDonorByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Donors'],
  summary: 'Get donor by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().openapi({ description: 'Donor ID' }) }),
  },
  responses: {
    200: { description: 'Success', content: { 'application/json': { schema: donorDetailResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
    404: { description: 'Donor not found', content: { 'application/json': { schema: errorWrapper } } },
  },
});

export const lookupDonorByPhoneRoute = createRoute({
  method: 'get',
  path: '/lookup/by-phone',
  tags: ['Donors'],
  summary: 'Lookup donor by phone',
  description: 'Fast phone lookup for checking existence and retrieving identity.',
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      phone: z.string().openapi({ description: 'Phone number' }),
    }),
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              id: z.string(),
              name: z.string(),
              phone: z.string(),
            }).nullable(),
            message: z.string().optional(),
          }),
        },
      },
    },
    400: { description: 'Missing query parameters', content: { 'application/json': { schema: errorWrapper } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
  },
});

export const createDonorRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Donors'],
  summary: 'Create donor',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: createDonorSchema },
      },
    },
  },
  responses: {
    201: { description: 'Donor created', content: { 'application/json': { schema: donorDetailResponseSchema } } },
    400: { description: 'Validation error', content: { 'application/json': { schema: errorWrapper } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
    409: { description: 'Donor already exists with this phone number', content: { 'application/json': { schema: errorWrapper } } },
  },
});

export const updateDonorRoute = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Donors'],
  summary: 'Update donor',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': { schema: updateDonorSchema },
      },
    },
  },
  responses: {
    200: { description: 'Donor updated', content: { 'application/json': { schema: donorDetailResponseSchema } } },
    400: { description: 'Validation error / No fields to update', content: { 'application/json': { schema: errorWrapper } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
    404: { description: 'Donor not found', content: { 'application/json': { schema: errorWrapper } } },
  },
});

export const deleteDonorRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Donors'],
  summary: 'Delete donor (Admin only)',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: { description: 'Donor deleted', content: { 'application/json': { schema: successNullResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
    403: { description: 'Forbidden', content: { 'application/json': { schema: errorWrapper } } },
    404: { description: 'Donor not found', content: { 'application/json': { schema: errorWrapper } } },
  },
});

export const blacklistDonorRoute = createRoute({
  method: 'post',
  path: '/{id}/blacklist',
  tags: ['Donors'],
  summary: 'Blacklist donor (Admin only)',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': { schema: blacklistDonorSchema },
      },
    },
  },
  responses: {
    200: { description: 'Donor blacklisted', content: { 'application/json': { schema: successNullResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
    403: { description: 'Forbidden', content: { 'application/json': { schema: errorWrapper } } },
    404: { description: 'Donor not found', content: { 'application/json': { schema: errorWrapper } } },
  },
});

export const unblacklistDonorRoute = createRoute({
  method: 'post',
  path: '/{id}/unblacklist',
  tags: ['Donors'],
  summary: 'Unblacklist donor (Admin only)',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: { description: 'Donor unblacklisted', content: { 'application/json': { schema: successNullResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
    403: { description: 'Forbidden', content: { 'application/json': { schema: errorWrapper } } },
    404: { description: 'Donor not found', content: { 'application/json': { schema: errorWrapper } } },
  },
});

export const listBlacklistedDonorsRoute = createRoute({
  method: 'get',
  path: '/blacklisted',
  tags: ['Donors'],
  summary: 'List blacklisted donors',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(donorSchema),
            message: z.string().optional(),
          }),
        },
      },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
  },
});

export const importDonorsRoute = createRoute({
  method: 'post',
  path: '/import',
  tags: ['Donors'],
  summary: 'Import donors from CSV (Admin only)',
  description: 'Upload a CSV file containing donor records.',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            file: z.any().openapi({
              type: 'string',
              format: 'binary',
              description: 'The CSV file to upload.',
            } as any),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: 'Success', content: { 'application/json': { schema: importResponseSchema } } },
    400: { description: 'Invalid file or structure', content: { 'application/json': { schema: errorWrapper } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
    403: { description: 'Forbidden', content: { 'application/json': { schema: errorWrapper } } },
  },
});

export const logDonorContactRoute = createRoute({
  method: 'post',
  path: '/{id}/contact',
  tags: ['Donors'],
  summary: 'Log contact with donor (Admin only)',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': { schema: logContactSchema },
      },
    },
  },
  responses: {
    200: { description: 'Success', content: { 'application/json': { schema: successNullResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
    403: { description: 'Forbidden', content: { 'application/json': { schema: errorWrapper } } },
    404: { description: 'Donor not found', content: { 'application/json': { schema: errorWrapper } } },
  },
});
