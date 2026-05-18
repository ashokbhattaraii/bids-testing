import { drizzle } from 'drizzle-orm/d1';
export * from './schema';
export type DbContext = { env: { DB: D1Database } };

/** Returns the raw D1 binding for existing SQL-based route handlers. */
export function db(c: DbContext): D1Database {
	return c.env.DB;
}

/** Creates a shared Drizzle client from the Cloudflare D1 binding. */
export function createDb(database: D1Database) {
	return drizzle(database);
}

/** Convenience helper for request-scoped handlers. */
export function drizzleDb(c: DbContext) {
	return createDb(c.env.DB);
}

export type AppDb = ReturnType<typeof createDb>;

export function newId(): string {
	return crypto.randomUUID();
}
