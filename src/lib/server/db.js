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
 * Uses postgres.js for local dev and Supabase, Neon HTTP for Neon only
 * @param {string} databaseUrl - The database connection URL
 * @returns {ReturnType<typeof drizzlePostgres> | ReturnType<typeof drizzleNeon>}
 */
export function createDb(databaseUrl) {
	// Validate database URL
	if (!databaseUrl || databaseUrl.trim() === '') {
		throw new Error('Database URL is required but was not provided');
	}

	// Return existing instance if already created
	const existingInstance = dbInstances.get(databaseUrl);
	if (existingInstance) {
		return existingInstance;
	}

	// Check if this is a Neon database (not Supabase)
	const isNeon = databaseUrl.includes('neon.tech') && !databaseUrl.includes('supabase');
	const isSupabase = databaseUrl.includes('supabase.co');

	let db;
	if (isNeon) {
		// Use Neon serverless driver for Neon databases only
		console.log('Using Neon HTTP driver for database connection');
		const sql = neon(databaseUrl);
		db = drizzleNeon(sql, { schema });
	} else {
		// Use postgres.js for local development and Supabase
		// Supabase works better with postgres.js, especially with connection pooler
		console.log(isSupabase ? 'Using postgres.js for Supabase connection' : 'Using postgres.js for local development');
		
		// For Supabase, ensure we're using the connection pooler URL format
		// Connection pooler URLs typically end with :6543 or have ?pgbouncer=true
		const sql = postgres(databaseUrl, {
			max: 10, // Maximum number of connections in the pool
			idle_timeout: 20, // Close idle connections after 20 seconds
			connect_timeout: 10, // Connection timeout
			// For Cloudflare Workers, we need to use fetch-based connections
			...(typeof fetch !== 'undefined' && {
				fetch: fetch
			})
		});
		db = drizzlePostgres(sql, { schema });
	}

	// Cache the instance
	dbInstances.set(databaseUrl, db);
	return db;
}

/** @typedef {ReturnType<typeof createDb>} Database */
