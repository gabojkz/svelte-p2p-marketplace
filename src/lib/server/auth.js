import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createDb } from './db.js';
import * as schema from './schema.js';

// Singleton auth instances to avoid recreating on every request
/** @type {Map<string, ReturnType<typeof betterAuth>>} */
const authInstances = new Map();

/**
 * Create auth instance (singleton pattern)
 * @param {string} databaseUrl - Database connection URL
 * @param {string} baseUrl - Base URL for the app
 * @returns {ReturnType<typeof betterAuth>}
 */
export function createAuth(databaseUrl, baseUrl) {
	const cacheKey = `${databaseUrl}:${baseUrl}`;
	
	// Return existing instance if already created
	if (authInstances.has(cacheKey)) {
		return authInstances.get(cacheKey);
	}

	const db = createDb(databaseUrl);

	const auth = betterAuth({
		database: drizzleAdapter(db, {
			provider: 'pg',
			schema: {
				user: schema.user,
				session: schema.session,
				account: schema.account,
				verification: schema.verification
			}
		}),
		baseURL: baseUrl,
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false
		},
		session: {
			expiresIn: 60 * 60 * 24 * 7, // 7 days
			updateAge: 60 * 60 * 24 // 1 day
		},
		trustedOrigins: [baseUrl]
	});

	// Cache the instance
	authInstances.set(cacheKey, auth);
	return auth;
}

/** @typedef {ReturnType<typeof createAuth>} Auth */

