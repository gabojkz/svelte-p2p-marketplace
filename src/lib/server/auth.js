import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createDb } from './db.js';
import * as schema from './schema.js';

/**
 * Create auth instance - called per-request in Cloudflare
 * @param {string} databaseUrl - Database connection URL
 * @param {string} baseUrl - Base URL for the app
 * @returns {ReturnType<typeof betterAuth>}
 */
export function createAuth(databaseUrl, baseUrl) {
	const db = createDb(databaseUrl);

	return betterAuth({
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
}

/** @typedef {ReturnType<typeof createAuth>} Auth */

