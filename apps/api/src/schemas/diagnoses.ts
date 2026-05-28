import { createRoute, z } from '@hono/zod-openapi';
import { errorWrapper } from './common';

export const diagnosisSchema = z.object({
  id: z.string().openapi({ example: 'diagnosis-seed-accident-trauma' }),
  name: z.string().openapi({ example: 'Accident/Trauma' }),
});

export const createDiagnosisSchema = z.object({
  name: z.string().trim().min(1).openapi({ example: 'Accident/Trauma', description: 'Name of the diagnosis/disease.' }),
});

export const listDiagnosesResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(diagnosisSchema),
  message: z.string().optional(),
});

export const detailDiagnosisResponseSchema = z.object({
  success: z.literal(true),
  data: diagnosisSchema,
  message: z.string().optional(),
});

export const listDiagnosesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Requests'],
  summary: 'List diagnoses',
  description: 'Returns all diagnoses in alphabetical order.',
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'Success', content: { 'application/json': { schema: listDiagnosesResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
  },
});

export const createDiagnosisRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Requests'],
  summary: 'Create a diagnosis',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: createDiagnosisSchema },
      },
    },
  },
  responses: {
    201: { description: 'Diagnosis created', content: { 'application/json': { schema: detailDiagnosisResponseSchema } } },
    200: { description: 'Diagnosis already exists (returns existing)', content: { 'application/json': { schema: detailDiagnosisResponseSchema } } },
    400: { description: 'Validation error', content: { 'application/json': { schema: errorWrapper } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
  },
});
