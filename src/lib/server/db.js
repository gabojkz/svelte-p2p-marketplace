import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';
import * as schema from './schema.js';

/**
 * Create database connection
 * Uses postgres.js for local dev, Neon for production (Cloudflare)
 * @param {string} databaseUrl - The database connection URL
 * @returns {ReturnType<typeof drizzlePostgres> | ReturnType<typeof drizzleNeon>}
 */
export function createDb(databaseUrl) {
	// Check if running on Cloudflare (production) or local
	const isProduction = databaseUrl.includes('neon.tech') || databaseUrl.includes('supabase.co');

	if (isProduction) {
		// Use Neon serverless driver for production
		const sql = neon(databaseUrl);
		return drizzleNeon(sql, { schema });
	} else {
		// Use postgres.js for local development
		const sql = postgres(databaseUrl);
		return drizzlePostgres(sql, { schema });
	}
}

/** @typedef {ReturnType<typeof createDb>} Database */
