import { z } from '@hono/zod-openapi';

export const paginationMetaSchema = z.object({
	page: z.number().openapi({ example: 1 }),
	limit: z.number().openapi({ example: 20 }),
	total: z.number().openapi({ example: 42 }),
	totalPages: z.number().openapi({ example: 3 }),
	hasNextPage: z.boolean().openapi({ example: true }),
	hasPrevPage: z.boolean().openapi({ example: false }),
});

export const errorWrapper = z.object({
	success: z.boolean(),
	message: z.string(),
});
