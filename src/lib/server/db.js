import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';

/**
 * CRITICAL FOR CLOUDFLARE WORKERS:
 * 
 * This file MUST use Neon HTTP driver for ALL production connections.
 * postgres.js uses TCP sockets which DON'T work in Cloudflare Workers.
 * 
 * Neon HTTP driver works with:
 * - Neon databases (neon.tech)
 * - Supabase databases (supabase.co) via connection pooler
 * 
 * Connection is created at module scope (edge-safe singleton pattern)
 */

// Singleton connection pools - created at module scope for edge safety
/** @type {Map<string, ReturnType<typeof drizzle>>} */
const dbInstances = new Map();

/**
 * Create database connection (singleton pattern)
 * 
 * ALWAYS uses Neon HTTP driver - works in both Cloudflare Workers and local dev
 * This is the ONLY driver that works in Cloudflare Workers (uses HTTP fetch, not TCP)
 * 
 * @param {string} databaseUrl - The database connection URL
 * @returns {ReturnType<typeof drizzle>}
 */
export function createDb(databaseUrl) {
	// Validate database URL
	if (!databaseUrl || databaseUrl.trim() === '') {
		throw new Error('Database URL is required but was not provided');
	}

	// Return existing instance if already created (singleton pattern)
	const existingInstance = dbInstances.get(databaseUrl);
	if (existingInstance) {
		return existingInstance;
	}

	console.log('Creating database connection with Neon HTTP driver (works with Supabase and Neon)');
	
	// Clean up connection string for HTTP driver
	// Remove pooler-specific params that might interfere with HTTP driver
	let cleanUrl = databaseUrl;
	try {
		const urlObj = new URL(cleanUrl);
		
		// Remove params that can break HTTP driver
		// Neon HTTP driver works with Supabase pooler, but some params cause issues
		urlObj.searchParams.delete('pgbouncer');
		urlObj.searchParams.delete('pooler');
		
		// Ensure SSL is required for secure HTTPS connections
		if (!urlObj.searchParams.has('sslmode')) {
			urlObj.searchParams.set('sslmode', 'require');
		}
		
		cleanUrl = urlObj.toString();
	} catch (e) {
		// If URL parsing fails, use original URL
		console.warn('Could not parse database URL, using as-is');
	}
	
	// Create Neon HTTP client - uses fetch API (works in Workers)
	const sql = neon(cleanUrl);
	
	// Create Drizzle instance with schema
	const db = drizzle(sql, { schema });
	
	// Cache the instance (singleton pattern)
	dbInstances.set(databaseUrl, db);
	
	return db;
}

/** @typedef {ReturnType<typeof createDb>} Database */
