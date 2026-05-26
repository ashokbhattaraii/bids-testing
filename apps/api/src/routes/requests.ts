import { drizzleDb, newId, hospitals, requests } from '@bids/db';
import { and, desc, eq, gte, like, lte, or, sql, type SQL } from 'drizzle-orm';
import { createRouter } from '../core/http/router';
import { jsonOk, jsonError } from '../core/http/errors';
import { buildPaginationMeta, parsePagination } from '../core/http/pagination';
import { requireAuth } from '../core/auth/middleware';
import {
  listRoute,
  createRequestRoute,
  getByIdRoute,
  updateRoute,
  bloodComponentSchema,
  requisitionFormMetadataSchema,
  createRequestMultipartSchema,
  type CreateRequestPayload
} from '../schemas/requests';
import { z } from '@hono/zod-openapi';

const router = createRouter();
router.use('*', requireAuth);

function parseOptionalNumber(value: unknown): number | undefined {
	if (value == null || value === '') return undefined;
	const parsed = typeof value === 'number' ? value : Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function parseSelectedComponents(value: unknown): z.infer<typeof bloodComponentSchema>[] | undefined {
	if (Array.isArray(value)) return value.filter(Boolean) as z.infer<typeof bloodComponentSchema>[];
	if (typeof value !== 'string' || !value.trim()) return undefined;
	return value
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean) as z.infer<typeof bloodComponentSchema>[];
}

function componentQuantitiesFromForm(form: z.infer<typeof createRequestMultipartSchema>): Record<string, number> | undefined {
	const quantities = {
		prbc: form.prbcQuantity,
		ffp: form.ffpQuantity,
		prp: form.prpQuantity,
		wb: form.wbQuantity,
		cry: form.cryQuantity,
		pc: form.pcQuantity,
		sdp: form.sdpQuantity,
		fb: form.fbQuantity,
	};
	const selected = new Set(parseSelectedComponents(form.selectedComponents));
	const entries = Object.entries(quantities).filter(([component, quantity]) => {
		const parsed = Number(quantity ?? 0);
		return Number.isFinite(parsed) && parsed > 0 && (selected.size === 0 || selected.has(component as z.infer<typeof bloodComponentSchema>));
	});

	return entries.length > 0 ? Object.fromEntries(entries.map(([component, quantity]) => [component, Number(quantity)])) : undefined;
}

function fileMetadata(file: unknown): z.infer<typeof requisitionFormMetadataSchema> | undefined {
	if (!file || typeof file === 'string') return undefined;
	const uploadedFile = file as File;
	return {
		name: uploadedFile.name,
		type: uploadedFile.type || undefined,
		size: uploadedFile.size,
		lastModified: 'lastModified' in uploadedFile ? uploadedFile.lastModified : undefined,
	};
}

function normalizeCreateFormBody(form: z.infer<typeof createRequestMultipartSchema>): CreateRequestPayload {
	const selectedComponents = parseSelectedComponents(form.selectedComponents);
	const componentQuantities = componentQuantitiesFromForm(form);
	const selectedFromQuantities = Object.keys(componentQuantities ?? {}) as z.infer<typeof bloodComponentSchema>[];
	const normalizedSelectedComponents = selectedComponents ?? (selectedFromQuantities.length > 0 ? selectedFromQuantities : undefined);

	return {
		patientName: form.patientName,
		requesterName: form.requesterName || undefined,
		requesterPhone: form.requesterPhone || undefined,
		diagnosis: form.diagnosis || undefined,
		hospitalId: form.hospitalId || undefined,
		hospital: form.hospital,
		bloodType: form.bloodType,
		totalPints: parseOptionalNumber(form.totalPints),
		urgency: form.urgency ?? 'high',
		status: form.status ?? 'pending',
		bloodRequiredOn: form.bloodRequiredOn || undefined,
		neededBy: form.neededBy || undefined,
		additionalNotes: form.additionalNotes || undefined,
		location: form.location ?? 'inside_valley',
		transportationRequired: form.transportationRequired,
		requestedAt: form.requestedAt || undefined,
		selectedComponents: normalizedSelectedComponents,
		componentQuantities,
		requisitionFormUpload: fileMetadata(form.requisitionFormUpload),
	};
}

// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(listRoute, async (c) => {
	const { status, urgency, bloodType, location, search, from, to, page, limit } = c.req.valid('query');
	const { page: pageNumber, limit: pageSize, offset } = parsePagination({ page, limit });
	const normalizedSearch = search.trim();
	const normalizedFrom = from.trim();
	const normalizedTo = to.trim();
	const fromDate = normalizedFrom === 'all' ? '' : normalizedFrom;
	const toDate = normalizedTo === 'all' ? '' : normalizedTo;

	const whereClauses: SQL[] = [];

	if (status && status !== 'all') {
		whereClauses.push(eq(requests.status, status));
	}
	if (urgency && urgency !== 'all') {
		whereClauses.push(eq(requests.urgency, urgency));
	}
	if (bloodType && bloodType !== 'all') {
		whereClauses.push(eq(requests.bloodType, bloodType));
	}
	if (location && location !== 'all') {
		whereClauses.push(eq(requests.location, location));
	}
	if (fromDate) {
		whereClauses.push(gte(requests.neededBy, fromDate));
	}
	if (toDate) {
		whereClauses.push(lte(requests.neededBy, toDate));
	}
	if (normalizedSearch) {
		const term = `%${normalizedSearch}%`;
		whereClauses.push(
			or(
				like(requests.id, term),
				like(requests.patientName, term),
				like(requests.hospital, term),
				like(requests.bloodType, term),
				like(requests.contactPerson, term)
			)!
		);
	}

	const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

	const orm = drizzleDb(c);
	const requestQuery = orm
		.select({
			id: requests.id,
			patientName: requests.patientName,
			hospital: requests.hospital,
			bloodType: requests.bloodType,
			quantity: requests.quantity,
			urgency: requests.urgency,
			status: requests.status,
			requestedAt: requests.requestedAt,
			neededBy: requests.neededBy,
			notes: requests.notes,
			contactPerson: requests.contactPerson,
			phone: requests.phone,
			location: requests.location,
		})
		.from(requests);

	const totalQuery = orm
		.select({ total: sql<number>`count(*)` })
		.from(requests);

	const [requestList, totalResult] = await Promise.all([
		(where ? requestQuery.where(where) : requestQuery)
			.orderBy(desc(requests.requestedAt))
			.limit(pageSize)
			.offset(offset),
		where ? totalQuery.where(where) : totalQuery,
	]);

	const total = Number(totalResult[0]?.total ?? 0);
	const meta = buildPaginationMeta(total, pageNumber, pageSize);

	return jsonOk(c, { items: requestList, meta });
});

// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(createRequestRoute, async (c) => {
	const contentType = c.req.header('content-type') ?? '';
	const body = contentType.startsWith('multipart/form-data') || contentType.startsWith('application/x-www-form-urlencoded')
		? normalizeCreateFormBody(c.req.valid('form') as z.infer<typeof createRequestMultipartSchema>)
		: c.req.valid('json') as CreateRequestPayload;
	const id = newId();
	const orm = drizzleDb(c);

	const createdAt = new Date().toISOString();
	const requestedAt = body.requestedAt ?? createdAt;
	const neededBy = body.bloodRequiredOn ?? body.neededBy ?? null;
	const componentQuantityTotal = Object.values(body.componentQuantities ?? {}).reduce<number>((sum, value) => {
		const parsed = typeof value === 'number' ? value : Number(value);
		return sum + (Number.isFinite(parsed) ? parsed : 0);
	}, 0);
	const quantity = body.totalPints ?? (componentQuantityTotal > 0 ? componentQuantityTotal : 1);

	let hospitalId = body.hospitalId ?? null;
	let hospitalName = body.hospital ?? null;
	let hospitalValley: 'inside_valley' | 'outside_valley' | null = null;

	if (hospitalId) {
		const hospitalExists = await orm
			.select({ id: hospitals.id, name: hospitals.name, valley: hospitals.valley })
			.from(hospitals)
			.where(eq(hospitals.id, hospitalId))
			.limit(1);

		if (!hospitalExists[0]) {
			return jsonError(c, 400, 'Selected hospital does not exist');
		}

		hospitalName = hospitalExists[0].name;
		hospitalValley = hospitalExists[0].valley as 'inside_valley' | 'outside_valley';
	} else if (hospitalName) {
		const normalizedHospitalName = hospitalName.replace(/\s+—\s+.*$/, '').trim();
		const matchedHospital = await orm
			.select({ id: hospitals.id, name: hospitals.name, valley: hospitals.valley })
			.from(hospitals)
			.where(eq(hospitals.name, normalizedHospitalName))
			.limit(1);

		if (!matchedHospital[0]) {
			return jsonError(c, 400, 'Selected hospital does not exist');
		}

		hospitalId = matchedHospital[0].id;
		hospitalName = matchedHospital[0].name;
		hospitalValley = matchedHospital[0].valley as 'inside_valley' | 'outside_valley';
	} else {
		return jsonError(c, 400, 'Hospital is required');
	}

	const selectedComponents = body.selectedComponents ? JSON.stringify(body.selectedComponents) : null;
	const componentQuantities = body.componentQuantities ? JSON.stringify(body.componentQuantities) : null;
	const images = body.images ? JSON.stringify(body.images) : null;
	const requisitionFormUpload = body.requisitionFormUpload ? JSON.stringify(body.requisitionFormUpload) : null;

	await orm.insert(requests).values({
		id,
		patientName: body.patientName,
		requesterName: body.requesterName ?? undefined,
		requesterPhone: body.requesterPhone ?? undefined,
		diagnosis: body.diagnosis ?? undefined,
		hospital: hospitalName,
		hospitalId,
		bloodType: body.bloodType,
		quantity,
		urgency: body.urgency,
		status: body.status,
		transportationRequired: body.transportationRequired ?? 'no',
		requestedAt,
		neededBy: neededBy ?? undefined,
		notes: body.additionalNotes ?? undefined,
		contactPerson: body.requesterName ?? undefined,
		phone: body.requesterPhone ?? undefined,
		location: hospitalValley ?? body.location,
		selectedComponents: selectedComponents ?? undefined,
		componentQuantities: componentQuantities ?? undefined,
		images: images ?? undefined,
		requisitionFormUpload: requisitionFormUpload ?? undefined,
		createdAt,
		updatedAt: createdAt,
	});

	const created = await orm.select().from(requests).where(eq(requests.id, id)).limit(1);

	if (!created[0]) return jsonError(c, 500, 'Request created but could not be loaded');

	return jsonOk(c, created[0], 'Request created', 201);
});

function parseJsonField<T>(value: string | null, fallback: T): T {
	if (!value) return fallback;
	try {
		return JSON.parse(value) as T;
	} catch {
		return fallback;
	}
}

function parseRequest(row: typeof requests.$inferSelect) {
	return {
		...row,
		selectedComponents: parseJsonField<string[]>(row.selectedComponents, []),
		componentQuantities: parseJsonField<Record<string, string | number>>(row.componentQuantities, {}),
		images: parseJsonField<Array<{ name?: string; preview?: string }>>(row.images, []),
		requisitionFormUpload: parseJsonField<z.infer<typeof requisitionFormMetadataSchema> | null>(row.requisitionFormUpload, null),
	};
}

// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(getByIdRoute, async (c) => {
	const orm = drizzleDb(c);
	const { id } = c.req.valid('param');
	const request = await orm.select().from(requests).where(eq(requests.id, id)).limit(1);

	if (!request[0]) return jsonError(c, 404, 'Request not found');

	return jsonOk(c, parseRequest(request[0]));
});

// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(updateRoute, async (c) => {
	const { id } = c.req.valid('param');
	const body = c.req.valid('json');
	const orm = drizzleDb(c);

	const existing = await orm.select().from(requests).where(eq(requests.id, id)).limit(1);
	if (!existing[0]) return jsonError(c, 404, 'Request not found');

	const updates: Record<string, unknown> = {
		updatedAt: new Date().toISOString(),
	};
	let hasChanges = false;

	const setValue = (key: string, value: unknown) => {
		updates[key] = value;
		hasChanges = true;
	};

	if ('patientName' in body && body.patientName !== undefined) setValue('patientName', body.patientName);
	if ('requesterName' in body) {
		setValue('requesterName', body.requesterName ?? null);
		setValue('contactPerson', body.requesterName ?? null);
	}
	if ('requesterPhone' in body) {
		setValue('requesterPhone', body.requesterPhone ?? null);
		setValue('phone', body.requesterPhone ?? null);
	}
	if ('diagnosis' in body) setValue('diagnosis', body.diagnosis ?? null);
	if ('bloodType' in body && body.bloodType !== undefined) setValue('bloodType', body.bloodType);
	if ('urgency' in body && body.urgency !== undefined) setValue('urgency', body.urgency);
	if ('status' in body && body.status !== undefined) setValue('status', body.status);
	if ('transportationRequired' in body) setValue('transportationRequired', body.transportationRequired ?? null);
	if ('bloodRequiredOn' in body || 'neededBy' in body) setValue('neededBy', body.bloodRequiredOn ?? body.neededBy ?? null);
	if ('additionalNotes' in body) setValue('notes', body.additionalNotes ?? null);
	if ('requestedAt' in body && body.requestedAt !== undefined) setValue('requestedAt', body.requestedAt);
	if ('selectedComponents' in body) {
		setValue('selectedComponents', body.selectedComponents ? JSON.stringify(body.selectedComponents) : null);
	}
	if ('componentQuantities' in body) {
		setValue('componentQuantities', body.componentQuantities ? JSON.stringify(body.componentQuantities) : null);
	}
	if ('images' in body) {
		setValue('images', body.images ? JSON.stringify(body.images) : null);
	}
	if ('requestReceivedFrom' in body) setValue('requestReceivedFrom', body.requestReceivedFrom ?? null);
	if ('requestManagedFrom' in body) setValue('requestManagedFrom', body.requestManagedFrom ?? null);
	if ('requestorEmail' in body) setValue('requestorEmail', body.requestorEmail ?? null);
	if ('patientFeedbackStatus' in body) setValue('patientFeedbackStatus', body.patientFeedbackStatus ?? null);
	if ('requisitionFormUpload' in body) {
		setValue('requisitionFormUpload', body.requisitionFormUpload ? JSON.stringify(body.requisitionFormUpload) : null);
	}

	const componentQuantityTotal = Object.values(body.componentQuantities ?? {}).reduce<number>((sum, value) => {
		const parsed = typeof value === 'number' ? value : Number(value);
		return sum + (Number.isFinite(parsed) ? parsed : 0);
	}, 0);

	if ('totalPints' in body || 'componentQuantities' in body) {
		setValue('quantity', body.totalPints ?? (componentQuantityTotal > 0 ? componentQuantityTotal : existing[0].quantity));
	}

	if ('hospitalId' in body || 'hospital' in body || 'location' in body) {
		let hospitalId = body.hospitalId ?? existing[0].hospitalId;
		let hospitalName = body.hospital ?? existing[0].hospital;
		let hospitalValley = body.location ?? existing[0].location;

		if (body.hospitalId) {
			const hospitalExists = await orm
				.select({ id: hospitals.id, name: hospitals.name, valley: hospitals.valley })
				.from(hospitals)
				.where(eq(hospitals.id, body.hospitalId))
				.limit(1);

			if (!hospitalExists[0]) return jsonError(c, 400, 'Selected hospital does not exist');

			hospitalId = hospitalExists[0].id;
			hospitalName = hospitalExists[0].name;
			hospitalValley = hospitalExists[0].valley;
		} else if (body.hospital) {
			const normalizedHospitalName = body.hospital.replace(/\s+—\s+.*$/, '').trim();
			const matchedHospital = await orm
				.select({ id: hospitals.id, name: hospitals.name, valley: hospitals.valley })
				.from(hospitals)
				.where(eq(hospitals.name, normalizedHospitalName))
				.limit(1);

			if (!matchedHospital[0]) return jsonError(c, 400, 'Selected hospital does not exist');

			hospitalId = matchedHospital[0].id;
			hospitalName = matchedHospital[0].name;
			hospitalValley = matchedHospital[0].valley;
		}

		setValue('hospitalId', hospitalId);
		setValue('hospital', hospitalName);
		setValue('location', hospitalValley);
	}

	if (!hasChanges) return jsonError(c, 400, 'No fields to update');

	await orm.update(requests).set(updates as Partial<typeof requests.$inferInsert>).where(eq(requests.id, id));

	const updated = await orm.select().from(requests).where(eq(requests.id, id)).limit(1);
	if (!updated[0]) return jsonError(c, 500, 'Request updated but could not be loaded');

	return jsonOk(c, parseRequest(updated[0]), 'Request updated');
});

export default router;
