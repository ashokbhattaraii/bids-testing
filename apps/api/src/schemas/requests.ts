import { createRoute, z } from '@hono/zod-openapi';
import { paginationMetaSchema, errorWrapper } from './common';



// ── Schemas ─────────────────────────────────────────────────────────────────

export const bloodTypeSchema = z.enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']);
export const urgencySchema = z.enum(['critical', 'high', 'moderate', 'low']);
export const statusSchema = z.enum(['pending', 'in_progress', 'fulfilled', 'cancelled']);
export const locationSchema = z.enum(['inside_valley', 'outside_valley']);
export const transportationRequiredSchema = z.enum(['yes', 'no', 'maybe']);
export const bloodComponentSchema = z.enum(['prbc', 'ffp', 'prp', 'wb', 'cry', 'pc', 'sdp', 'fb']);
export const bloodTypeFilterSchema = z.enum(['all', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']);
export const urgencyFilterSchema = z.enum(['all', 'critical', 'high', 'moderate', 'low']);
export const statusFilterSchema = z.enum(['all', 'pending', 'in_progress', 'fulfilled', 'cancelled']);
export const locationFilterSchema = z.enum(['all', 'inside_valley', 'outside_valley']);
export const requestSourceSchema = z.enum(['Hospital', 'Patient Family', 'Doctor', 'Volunteer', 'Phone Call', 'WhatsApp', 'Social Media', 'Other']);
export const requestManagedFromSchema = z.enum(['BIDS Team', 'Hospital', 'Patient Family', 'Volunteer', 'Other Blood Bank', 'Other']);
export const patientFeedbackStatusSchema = z.enum(['Pending', 'Received', 'Follow Up Needed', 'Not Required', 'Resolved']);
export const requisitionFormMetadataSchema = z.object({
	name: z.string().optional().openapi({ example: 'requisition-form.pdf' }),
	type: z.string().optional().openapi({ example: 'application/pdf' }),
	size: z.number().int().min(0).optional().openapi({ example: 245760 }),
	lastModified: z.number().optional().openapi({ example: 1779427200000 }),
});
export const multipartNumberSchema = z.preprocess(
	(value) => (value == null || value === '' ? undefined : Number(value)),
	z.number().int().min(0).optional()
);
export const multipartSelectedComponentsSchema = z.preprocess((value) => {
	if (value == null || value === '') return undefined;
	return Array.isArray(value) ? value : [value];
}, z.array(bloodComponentSchema).optional());

export const createSchema = z.object({
	patientName: z.string().min(1).openapi({ example: 'Ramesh Sharma', description: 'Patient name shown on the request.' }),
	requesterName: z.string().optional().openapi({ example: 'Sita Sharma', description: 'Primary contact person for this request.' }),
	requesterPhone: z.string().optional().openapi({ example: '9841234567', description: 'Requester phone number.' }),
	diagnosis: z.string().optional().openapi({ example: 'Accident/Trauma', description: 'Diagnosis or reason for blood requirement.' }),
	hospitalId: z.string().optional().openapi({ example: 'hosp_01JZK8M8H6A4P2G9Q2R7S8T9V0', description: 'Preferred hospital ID. If provided, it is used to resolve hospital name and valley.' }),
	hospital: z.string().min(1).openapi({ example: 'Kathmandu Medical Center', description: 'Hospital name. Must match an existing hospital when hospitalId is not provided.' }),
	bloodType: bloodTypeSchema.openapi({ example: 'O+', description: 'Required blood group.' }),
	totalPints: z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().int().min(1)).optional().openapi({ example: 2, description: 'Total units/pints required. If omitted, componentQuantities are summed.' }),
	urgency: urgencySchema.default('high').openapi({ example: 'high', description: 'Operational urgency of the request.' }),
	status: statusSchema.default('pending').openapi({ example: 'pending', description: 'Initial request status.' }),
	bloodRequiredOn: z.string().optional().openapi({ example: '2026-05-23', description: 'Required date from the form, usually YYYY-MM-DD.' }),
	neededBy: z.string().optional().openapi({ example: '2026-05-23T10:30:00.000Z', description: 'Optional ISO deadline. bloodRequiredOn is used first when provided.' }),
	additionalNotes: z.string().optional().openapi({ example: 'Please call before dispatching donors.', description: 'Remarks from Additional Details.' }),
	location: locationSchema.default('inside_valley').openapi({ example: 'inside_valley', description: 'Request location classification.' }),
	transportationRequired: transportationRequiredSchema.optional().openapi({ example: 'no', description: 'Whether transport support is required.' }),
	requestedAt: z.string().optional().openapi({ example: '2026-05-22T09:15:00.000Z', description: 'Request creation timestamp. Defaults to server time.' }),
	selectedComponents: z.array(bloodComponentSchema).optional().openapi({ example: ['prbc', 'ffp'], description: 'Selected blood components.' }),
	componentQuantities: z.record(z.string(), z.number()).optional().openapi({ example: { prbc: 1, ffp: 1 }, description: 'Quantity per selected component, keyed by component code.' }),
	images: z.array(z.object({
		name: z.string().optional().openapi({ example: 'prescription.jpg' }),
		preview: z.string().optional().openapi({ example: 'blob:http://localhost:3000/f2a4...' }),
	})).optional().openapi({ example: [{ name: 'prescription.jpg', preview: 'blob:http://localhost:3000/f2a4...' }], description: 'Optional image metadata from the create form.' }),
	requestReceivedFrom: requestSourceSchema.optional().openapi({ example: 'Hospital', description: 'Edit-only additional detail.' }),
	requestManagedFrom: requestManagedFromSchema.optional().openapi({ example: 'BIDS Team', description: 'Edit-only additional detail.' }),
	requestorEmail: z.string().email().optional().openapi({ example: 'requester@example.com', description: 'Edit-only requestor email.' }),
	patientFeedbackStatus: patientFeedbackStatusSchema.optional().openapi({ example: 'Pending', description: 'Edit-only patient feedback status.' }),
	requisitionFormUpload: requisitionFormMetadataSchema.optional().openapi({ example: { name: 'requisition-form.pdf', type: 'application/pdf', size: 245760 }, description: 'Requisition form metadata. In Swagger, choose multipart/form-data on POST /requests to upload the actual file.' }),
});

export const createRequestBodySchema = createSchema.omit({
	requestReceivedFrom: true,
	requestManagedFrom: true,
	requestorEmail: true,
	patientFeedbackStatus: true,
}).openapi({
	example: {
		patientName: 'Ramesh Sharma',
		requesterName: 'Sita Sharma',
		requesterPhone: '9841234567',
		diagnosis: 'Accident/Trauma',
		hospitalId: 'hosp_01JZK8M8H6A4P2G9Q2R7S8T9V0',
		hospital: 'Kathmandu Medical Center',
		bloodType: 'O+',
		totalPints: 2,
		urgency: 'high',
		status: 'pending',
		bloodRequiredOn: '2026-05-23',
		additionalNotes: 'Please call before dispatching donors.',
		location: 'inside_valley',
		transportationRequired: 'no',
		selectedComponents: ['prbc', 'ffp'],
		componentQuantities: {
			prbc: 1,
			ffp: 1,
		},
		requisitionFormUpload: {
			name: 'requisition-form.pdf',
			type: 'application/pdf',
			size: 245760,
		},
	},
	description: 'JSON body for creating a request. Use multipart/form-data on this same endpoint in Swagger when you want a file picker.',
});

export const createRequestMultipartSchema = z.object({
	patientName: z.string().min(1).openapi({ example: 'Ramesh Sharma', description: 'Patient name shown on the request.' }),
	requesterName: z.string().optional().openapi({ example: 'Sita Sharma' }),
	requesterPhone: z.string().optional().openapi({ example: '9841234567' }),
	diagnosis: z.string().optional().openapi({ example: 'Accident/Trauma' }),
	hospitalId: z.string().optional().openapi({ example: 'hosp_01JZK8M8H6A4P2G9Q2R7S8T9V0' }),
	hospital: z.string().min(1).openapi({ example: 'Kathmandu Medical Center' }),
	bloodType: bloodTypeSchema.openapi({ example: 'O+' }),
	totalPints: z.string().optional().openapi({ example: '2', description: 'Number as text for multipart/form-data.' }),
	urgency: urgencySchema.optional().openapi({ example: 'high' }),
	status: statusSchema.optional().openapi({ example: 'pending' }),
	bloodRequiredOn: z.string().optional().openapi({ example: '2026-05-23' }),
	neededBy: z.string().optional().openapi({ example: '2026-05-23T10:30:00.000Z' }),
	additionalNotes: z.string().optional().openapi({ example: 'Please call before dispatching donors.' }),
	location: locationSchema.optional().openapi({ example: 'inside_valley' }),
	transportationRequired: transportationRequiredSchema.optional().openapi({ example: 'no' }),
	requestedAt: z.string().optional().openapi({ example: '2026-05-22T09:15:00.000Z' }),
	selectedComponents: multipartSelectedComponentsSchema.openapi({ example: ['prbc', 'ffp'], description: 'Select one or more blood components.' }),
	prbcQuantity: multipartNumberSchema.openapi({ example: 1, description: 'Packed red blood cells quantity.' }),
	ffpQuantity: multipartNumberSchema.openapi({ example: 1, description: 'Fresh frozen plasma quantity.' }),
	prpQuantity: multipartNumberSchema.openapi({ example: 0, description: 'Platelet rich plasma quantity.' }),
	wbQuantity: multipartNumberSchema.openapi({ example: 0, description: 'Whole blood quantity.' }),
	cryQuantity: multipartNumberSchema.openapi({ example: 0, description: 'Cryoprecipitate quantity.' }),
	pcQuantity: multipartNumberSchema.openapi({ example: 0, description: 'Platelet concentrate quantity.' }),
	sdpQuantity: multipartNumberSchema.openapi({ example: 0, description: 'Single Donor Platelets quantity.' }),
	fbQuantity: multipartNumberSchema.openapi({ example: 0, description: 'Fresh Blood quantity.' }),
	requisitionFormUpload: z.any().optional().openapi({
		type: 'string',
		format: 'binary',
		description: 'Requisition form upload. Swagger renders this as a Choose File control.',
	} as any),
}).openapi({
	example: {
		patientName: 'Ramesh Sharma',
		requesterName: 'Sita Sharma',
		requesterPhone: '9841234567',
		diagnosis: 'Accident/Trauma',
		hospital: 'Kathmandu Medical Center',
		bloodType: 'O+',
		totalPints: '2',
		urgency: 'high',
		status: 'pending',
		bloodRequiredOn: '2026-05-23',
		additionalNotes: 'Please call before dispatching donors.',
		location: 'inside_valley',
		transportationRequired: 'no',
		selectedComponents: ['prbc', 'ffp'],
		prbcQuantity: 1,
		ffpQuantity: 1,
	},
	description: 'Multipart body for creating a request from Swagger with dropdown fields, numeric quantity inputs, and a file picker.',
});

export const updateSchema = createSchema.partial().openapi({
	example: {
		status: 'fulfilled',
		requestReceivedFrom: 'Hospital',
		requestManagedFrom: 'BIDS Team',
		requestorEmail: 'requester@example.com',
		patientFeedbackStatus: 'Received',
		additionalNotes: 'Managed by BIDS team. Patient family notified.',
		requisitionFormUpload: {
			name: 'requisition-form.pdf',
			type: 'application/pdf',
			size: 245760,
		},
	},
	description: 'Partial request update body. Edit-only Additional Details fields are available here.',
});

// Response / data schemas for OpenAPI
export const requestSummarySchema = z.object({
	id: z.string().openapi({ example: 'req_01JZK8S1A2B3C4D5E6F7G8H9J0' }),
	patientName: z.string().openapi({ example: 'Ramesh Sharma' }),
	hospital: z.string().nullable(),
	bloodType: bloodTypeSchema,
	quantity: z.number().openapi({ example: 2 }),
	urgency: urgencySchema,
	status: statusSchema,
	requestedAt: z.string().nullable(),
	neededBy: z.string().nullable(),
	notes: z.string().nullable(),
	contactPerson: z.string().nullable(),
	phone: z.string().nullable(),
	location: locationSchema.nullable(),
});

export const listResponseSchema = z.object({
	success: z.literal(true),
	data: z.object({ items: z.array(requestSummarySchema), meta: paginationMetaSchema }),
	message: z.string().optional(),
});

export const requestDetailSchema = z.object({
	id: z.string().openapi({ example: 'req_01JZK8S1A2B3C4D5E6F7G8H9J0' }),
	patientName: z.string().openapi({ example: 'Ramesh Sharma' }),
	requesterName: z.string().nullable().openapi({ example: 'Sita Sharma' }),
	requesterPhone: z.string().nullable().openapi({ example: '9841234567' }),
	diagnosis: z.string().nullable().openapi({ example: 'Accident/Trauma' }),
	hospital: z.string().nullable().openapi({ example: 'Kathmandu Medical Center' }),
	hospitalId: z.string().nullable().openapi({ example: 'hosp_01JZK8M8H6A4P2G9Q2R7S8T9V0' }),
	bloodType: bloodTypeSchema,
	quantity: z.number().openapi({ example: 2 }),
	urgency: urgencySchema,
	status: statusSchema,
	transportationRequired: transportationRequiredSchema.nullable(),
	requestedAt: z.string().nullable().openapi({ example: '2026-05-22T09:15:00.000Z' }),
	neededBy: z.string().nullable().openapi({ example: '2026-05-23' }),
	notes: z.string().nullable().openapi({ example: 'Please call before dispatching donors.' }),
	contactPerson: z.string().nullable().openapi({ example: 'Sita Sharma' }),
	phone: z.string().nullable().openapi({ example: '9841234567' }),
	location: locationSchema.nullable(),
	selectedComponents: z.array(bloodComponentSchema).nullable().openapi({ example: ['prbc', 'ffp'] }),
	componentQuantities: z.record(z.string(), z.number()).nullable().openapi({ example: { prbc: 1, ffp: 1 } }),
	images: z.array(z.object({ name: z.string().optional(), preview: z.string().optional() })).nullable().openapi({ example: [{ name: 'prescription.jpg', preview: 'blob:http://localhost:3000/f2a4...' }] }),
	requestReceivedFrom: requestSourceSchema.nullable(),
	requestManagedFrom: requestManagedFromSchema.nullable(),
	requestorEmail: z.string().email().nullable().openapi({ example: 'requester@example.com' }),
	patientFeedbackStatus: patientFeedbackStatusSchema.nullable(),
	requisitionFormUpload: requisitionFormMetadataSchema.nullable(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

export const detailResponseSchema = z.object({ success: z.literal(true), data: requestDetailSchema, message: z.string().optional() });

export const createResponseSchema = z.object({ success: z.literal(true), data: requestDetailSchema, message: z.string().optional() });

// ── Route definitions ───────────────────────────────────────────────────────

export const listRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Requests'],
	summary: 'List blood requests',
	description: 'Supports filtering by status, urgency, bloodType, location, date range, and search.',
	security: [{ bearerAuth: [] }],
	request: {
		query: z.object({
			status: statusFilterSchema.default('all').openapi({ example: 'all', description: 'Filter by request status. Use all to include every status.' }),
			urgency: urgencyFilterSchema.default('all').openapi({ example: 'all', description: 'Filter by urgency. Use all to include every urgency.' }),
			bloodType: bloodTypeFilterSchema.default('all').openapi({ example: 'all', description: 'Filter by required blood group. Use all to include every blood group.' }),
			location: locationFilterSchema.default('all').openapi({ example: 'all', description: 'Filter by request location. Use all to include both locations.' }),
			search: z.string().default('').openapi({ description: 'Optional search across request ID, patient, hospital, blood group, or contact person. Leave empty to include all requests.' }),
			from: z.string().default('all').openapi({ example: 'all', description: 'Start date filter for neededBy. Use all for no start date, or enter YYYY-MM-DD.' }),
			to: z.string().default('all').openapi({ example: 'all', description: 'End date filter for neededBy. Use all for no end date, or enter YYYY-MM-DD.' }),
			page: z.string().default('1').openapi({ example: '1', description: 'Page number. Defaults to 1.' }),
			limit: z.string().default('20').openapi({ example: '20', description: 'Items per page. Defaults to 20; maximum is handled by the API pagination helper.' }),
		}),
	},
	responses: {
		200: { description: 'Paginated list of requests', content: { 'application/json': { schema: listResponseSchema } } },
		401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
	},
});

export const createRequestRoute = createRoute({
	method: 'post',
	path: '/',
	tags: ['Requests'],
	summary: 'Create a blood request',
	description: 'Creates the intake/request form record. Swagger defaults to multipart/form-data so select fields render as dropdowns and requisitionFormUpload renders as a file picker. API clients may still use application/json.',
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			content: {
				'multipart/form-data': { schema: createRequestMultipartSchema },
				'application/json': { schema: createRequestBodySchema },
			},
		},
	},
	responses: {
		201: { description: 'Request created', content: { 'application/json': { schema: createResponseSchema } } },
		400: { description: 'Validation error', content: { 'application/json': { schema: errorWrapper } } },
		401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
	},
});

export const getByIdRoute = createRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Requests'],
	summary: 'Get a blood request by ID',
	security: [{ bearerAuth: [] }],
	request: {
		params: z.object({ id: z.string() }),
	},
	responses: {
		200: { description: 'Request details', content: { 'application/json': { schema: detailResponseSchema } } },
		401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
		404: { description: 'Not found', content: { 'application/json': { schema: errorWrapper } } },
	},
});

export const updateRoute = createRoute({
	method: 'put',
	path: '/{id}',
	tags: ['Requests'],
	summary: 'Update a blood request',
	description: 'Partially updates a request. This endpoint includes edit-only Additional Details such as request source, managed-from value, requestor email, feedback status, remarks, and requisition form metadata.',
	security: [{ bearerAuth: [] }],
	request: {
		params: z.object({ id: z.string() }),
		body: { content: { 'application/json': { schema: updateSchema } } },
	},
	responses: {
		200: { description: 'Request updated', content: { 'application/json': { schema: detailResponseSchema } } },
		400: { description: 'Validation error', content: { 'application/json': { schema: errorWrapper } } },
		401: { description: 'Unauthorized', content: { 'application/json': { schema: errorWrapper } } },
		404: { description: 'Not found', content: { 'application/json': { schema: errorWrapper } } },
	},
});

// ── Handlers ────────────────────────────────────────────────────────────────


export type CreateRequestPayload = z.infer<typeof createRequestBodySchema>;
