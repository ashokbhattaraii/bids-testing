import { createRoute, z } from '@hono/zod-openapi';
import { paginationMetaSchema, errorWrapper } from './common';

export const valleySchema = z.enum(['inside_valley', 'outside_valley']);
export const valleyFilterSchema = z.enum(['all', 'inside_valley', 'outside_valley']);

export const hospitalSchema = z.object({
  id: z.string().openapi({ example: 'hosp_01JZK8M8H6A4P2G9Q2R7S8T9V0' }),
  name: z.string().openapi({ example: 'Kathmandu Medical Center' }),
  location: z.string().openapi({ example: 'Sinamangal, Kathmandu' }),
  valley: valleySchema.openapi({ example: 'inside_valley' }),
  contactPerson: z.string().nullable().openapi({ example: 'Dr. Sita Sharma' }),
  phone: z.string().nullable().openapi({ example: '01-4567890' }),
});

export const createHospitalSchema = z.object({
  name: z.string().trim().min(1).openapi({ example: 'Kathmandu Medical Center', description: 'Hospital name.' }),
  location: z.string().trim().min(1).openapi({ example: 'Sinamangal, Kathmandu', description: 'Hospital location or address.' }),
  contactPerson: z.string().trim().min(1).optional().openapi({ example: 'Dr. Sita Sharma', description: 'Primary contact person.' }),
  phone: z.string().trim().min(1).optional().openapi({ example: '01-4567890', description: 'Hospital contact number.' }),
  valley: valleySchema.optional().openapi({ example: 'inside_valley', description: 'Hospital valley classification.' }),
}).openapi({
  example: {
    name: 'Kathmandu Medical Center',
    location: 'Sinamangal, Kathmandu',
    contactPerson: 'Dr. Sita Sharma',
    phone: '01-4567890',
    valley: 'inside_valley',
  },
});

export const listHospitalResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(hospitalSchema),
    meta: paginationMetaSchema,
  }),
  message: z.string().optional(),
});

export const detailHospitalResponseSchema = z.object({
  success: z.literal(true),
  data: hospitalSchema,
  message: z.string().optional(),
});

export const listHospitalRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Hospitals'],
  summary: 'List hospitals',
  description: 'Supports search, valley filtering, and pagination.',
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      search: z.string().default('').openapi({ description: 'Optional search across hospital name, location, contact person, or phone. Leave empty to include all hospitals.' }),
      valley: valleyFilterSchema.default('all').openapi({ example: 'all', description: 'Filter by valley. Use all to include every hospital.' }),
      page: z.string().default('1').openapi({ example: '1', description: 'Page number. Defaults to 1.' }),
      limit: z.string().default('20').openapi({ example: '20', description: 'Items per page. Defaults to 20; maximum is handled by the API pagination helper.' }),
    }),
  },
  responses: {
    200: { description: 'Paginated list of hospitals', content: { 'application/json': { schema: listHospitalResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
  },
});

export const createHospitalRouteDefinition = createRoute({
  method: 'post',
  path: '/',
  tags: ['Hospitals'],
  summary: 'Create a hospital',
  description: 'Creates a hospital. Swagger defaults to form-urlencoded so valley renders as a select; API clients may still use application/json.',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/x-www-form-urlencoded': { schema: createHospitalSchema },
        'application/json': { schema: createHospitalSchema },
      },
    },
  },
  responses: {
    201: { description: 'Hospital created', content: { 'application/json': { schema: detailHospitalResponseSchema } } },
    400: { description: 'Validation error', content: { 'application/json': { schema: errorWrapper } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
  },
});
