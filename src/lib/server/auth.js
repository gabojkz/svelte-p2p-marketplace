import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createDb } from './db.js';
import * as schema from './schema.js';
import bcrypt from 'bcryptjs';

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
			requireEmailVerification: false,
			// Use bcrypt (Blowfish) for password hashing
			// Alternative: To use Argon2 instead, install @node-rs/argon2 and replace with:
			// password: {
			//   hash: async (password) => {
			//     const { hash } = await import('@node-rs/argon2');
			//     return await hash(password, { memoryCost: 65536, timeCost: 3, parallelism: 4 });
			//   },
			//   verify: async (data) => {
			//     const { verify } = await import('@node-rs/argon2');
			//     return await verify(data.hash, data.password);
			//   }
			// }
			password: {
				hash: async (password) => {
					const saltRounds = 10;
					return await bcrypt.hash(password, saltRounds);
				},
				verify: async (data) => {
					const { password, hash } = data;
					return await bcrypt.compare(password, hash);
				}
			}
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

