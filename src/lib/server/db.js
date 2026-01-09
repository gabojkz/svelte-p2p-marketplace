import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';
import * as schema from './schema.js';

/**
 * CRITICAL FOR CLOUDFLARE WORKERS:
 * 
 * This file automatically selects the appropriate driver:
 * - Local databases (localhost): Uses postgres.js (TCP-based)
 * - Remote databases (Neon/Supabase): Uses Neon HTTP driver (HTTP-based)
 * 
 * Neon HTTP driver works with:
 * - Neon databases (neon.tech)
 * - Supabase databases (supabase.co) via connection pooler
 * - Cloudflare Workers (uses HTTP fetch, not TCP)
 * 
 * postgres.js works with:
 * - Local PostgreSQL databases (localhost, 127.0.0.1)
 * - Does NOT work in Cloudflare Workers (TCP sockets not supported)
 * 
 * Connection is created at module scope (edge-safe singleton pattern)
 */

// Singleton connection pools - created at module scope for edge safety
/** @type {Map<string, ReturnType<typeof drizzleNeon | typeof drizzlePostgres>>} */
const dbInstances = new Map();

/**
 * Check if database URL points to a local database
 * @param {string} host - The database hostname
 * @returns {boolean}
 */
function isLocalDatabase(host) {
	if (!host) return false;
	const hostLower = host.toLowerCase().trim();
	
	// Check for localhost variants
	if (hostLower === 'localhost' || hostLower === '127.0.0.1' || hostLower === '::1') {
		return true;
	}
	
	// Check for local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
	const localIpPattern = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/;
	if (localIpPattern.test(host)) {
		return true;
	}
	
	return false;
}

/**
 * Validate and normalize database URL
 * @param {string} databaseUrl - The database connection URL
 * @returns {{ cleanUrl: string, host: string, isValid: boolean, errors: string[], isLocal: boolean }}
 */
function validateDatabaseUrl(databaseUrl) {
	const errors = [];
	let cleanUrl = databaseUrl;
	let host = '';
	let isValid = true;

	try {
		const urlObj = new URL(cleanUrl);
		host = urlObj.hostname;

		// Check protocol
		if (!['postgresql:', 'postgres:'].includes(urlObj.protocol)) {
			errors.push(`Invalid protocol: ${urlObj.protocol}. Expected postgresql:// or postgres://`);
			isValid = false;
		}

		// Check hostname
		if (!host || host.trim() === '') {
			errors.push('Database hostname is missing or empty');
			isValid = false;
		}

		const isLocal = isLocalDatabase(host);

		// For local databases, don't require SSL and keep original URL
		// For remote databases, clean up params and ensure SSL
		if (!isLocal) {
			// Remove params that can break HTTP driver
			urlObj.searchParams.delete('pgbouncer');
			urlObj.searchParams.delete('pooler');

			// Ensure SSL is required for secure HTTPS connections
			if (!urlObj.searchParams.has('sslmode')) {
				urlObj.searchParams.set('sslmode', 'require');
			}
			cleanUrl = urlObj.toString();
		}
		// For local databases, use the original URL as-is

		return { cleanUrl, host, isValid, errors, isLocal };
	} catch (e) {
		/** @type {any} */
		const err = e;
		errors.push(`Invalid database URL format: ${err?.message || String(e)}`);
		isValid = false;
		return { cleanUrl, host, isValid, errors, isLocal: false };
	}
}

/**
 * Create database connection (singleton pattern)
 * 
 * Automatically selects the appropriate driver:
 * - Local databases: Uses postgres.js (TCP-based)
 * - Remote databases: Uses Neon HTTP driver (HTTP-based, works in Cloudflare Workers)
 * 
 * @param {string} databaseUrl - The database connection URL
 * @returns {ReturnType<typeof drizzleNeon | typeof drizzlePostgres>}
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

	// Validate and clean the database URL
	const { cleanUrl, host, isValid, errors, isLocal } = validateDatabaseUrl(databaseUrl);

	if (!isValid) {
		const errorMessage = `Invalid database URL: ${errors.join('; ')}`;
		console.error('Database URL validation failed:', {
			errors,
			urlPreview: databaseUrl ? `${databaseUrl.substring(0, 30)}...` : 'N/A',
			urlLength: databaseUrl?.length || 0
		});
		throw new Error(errorMessage);
	}

	try {
		// Log connection details (without sensitive info)
		const driverType = isLocal ? 'postgres.js (TCP)' : 'Neon HTTP (fetch)';
		console.log(`Creating database connection with ${driverType} driver`);
		console.log('Connecting to database:', {
			host,
			urlLength: cleanUrl.length,
			isLocal,
			isSupabase: host.includes('supabase.co'),
			isNeon: host.includes('neon.tech')
		});

		let db;

		if (isLocal) {
			// Use postgres.js for local databases (TCP-based)
			// This works with local PostgreSQL but NOT in Cloudflare Workers
			const sql = postgres(cleanUrl, {
				max: 10, // Connection pool size
				idle_timeout: 20,
				connect_timeout: 10
			});
			db = drizzlePostgres(sql, { schema });
		} else {
			// Use Neon HTTP driver for remote databases (HTTP-based)
			// This works in Cloudflare Workers and with Neon/Supabase
			const sql = neon(cleanUrl);
			db = drizzleNeon(sql, { schema });
		}

		// Cache the instance (singleton pattern)
		dbInstances.set(databaseUrl, db);

		console.log('Database connection created successfully');
		return db;
	} catch (error) {
		/** @type {any} */
		const err = error;
		
		// Enhanced error logging with diagnostic information
		/** @type {Record<string, any>} */
		const errorDetails = {
			error: err?.message,
			errorType: err?.constructor?.name,
			host,
			isLocal,
			urlPreview: cleanUrl ? `${cleanUrl.substring(0, 30)}...` : 'N/A',
			urlLength: cleanUrl?.length || 0,
			cause: err?.cause ? {
				message: err.cause?.message,
				type: err.cause?.constructor?.name
			} : undefined
		};

		// Check for common error patterns
		if (err?.message?.includes('fetch failed') || err?.cause?.message?.includes('fetch failed')) {
			if (isLocal) {
				errorDetails.diagnosis = 'Local database connection failed. Possible causes: ' +
					'1) PostgreSQL server is not running, ' +
					'2) Incorrect connection string, ' +
					'3) Port is blocked or incorrect, ' +
					'4) Authentication failed';
			} else {
				errorDetails.diagnosis = 'Network connectivity issue. Possible causes: ' +
					'1) Database server is unreachable, ' +
					'2) DNS resolution failure, ' +
					'3) Firewall blocking connection, ' +
					'4) SSL/TLS handshake failure, ' +
					'5) Incorrect database URL or hostname';
			}
		}

		console.error('Failed to create database connection:', errorDetails);
		console.error('Full error stack:', err?.stack);

		// Create a more helpful error message
		const helpfulError = new Error(
			`Database connection failed: ${err?.message || 'Unknown error'}. ` +
			`Host: ${host || 'unknown'}. ` +
			`Driver: ${isLocal ? 'postgres.js (TCP)' : 'Neon HTTP (fetch)'}. ` +
			`This could be due to network connectivity issues, DNS problems, or an incorrect DATABASE_URL. ` +
			`Please verify your DATABASE_URL environment variable and network connectivity.`
		);
		/** @type {any} */
		const helpfulErr = helpfulError;
		helpfulErr.cause = err;
		throw helpfulError;
	}
}

/** @typedef {ReturnType<typeof createDb>} Database */
