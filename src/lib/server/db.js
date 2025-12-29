import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';
import * as schema from './schema.js';

// Singleton connection pools to avoid connection exhaustion
/** @type {Map<string, ReturnType<typeof drizzlePostgres> | ReturnType<typeof drizzleNeon>>} */
const dbInstances = new Map();

/**
 * Create database connection (singleton pattern)
 * Uses postgres.js for local dev, Neon for production (Cloudflare)
 * @param {string} databaseUrl - The database connection URL
 * @returns {ReturnType<typeof drizzlePostgres> | ReturnType<typeof drizzleNeon>}
 */
export function createDb(databaseUrl) {
	// Return existing instance if already created
	if (dbInstances.has(databaseUrl)) {
		return dbInstances.get(databaseUrl);
	}

	// Check if running on Cloudflare (production) or local
	const isProduction = databaseUrl.includes('neon.tech') || databaseUrl.includes('supabase.co');

	let db;
	if (isProduction) {
		// Use Neon serverless driver for production
		const sql = neon(databaseUrl);
		db = drizzleNeon(sql, { schema });
	} else {
		// Use postgres.js for local development with connection pooling
		const sql = postgres(databaseUrl, {
			max: 10, // Maximum number of connections in the pool
			idle_timeout: 20, // Close idle connections after 20 seconds
			connect_timeout: 10, // Connection timeout
		});
		db = drizzlePostgres(sql, { schema });
	}

	// Cache the instance
	dbInstances.set(databaseUrl, db);
	return db;
}

/** @typedef {ReturnType<typeof createDb>} Database */
