import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createDb } from './db.js';
import * as schema from './schema.js';
import bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';

// Singleton auth instances to avoid recreating on every request
/** @type {Map<string, ReturnType<typeof betterAuth>>} */
const authInstances = new Map();

/**
 * Create auth instance (singleton pattern)
 * @param {string} databaseUrl - Database connection URL
 * @param {string} baseUrl - Base URL for the app
 * @param {any} [env] - Environment variables (platform.env for Cloudflare Workers)
 * @returns {ReturnType<typeof betterAuth>}
 */
export function createAuth(databaseUrl, baseUrl, env = null) {
	const cacheKey = `${databaseUrl}:${baseUrl}`;
	
	// Return existing instance if already created
	const existingAuth = authInstances.get(cacheKey);
	if (existingAuth) {
		return existingAuth;
	}

	const db = createDb(databaseUrl);

	// Get REQUIRE_EMAIL_VERIFICATION from env or process.env
	/**
	 * @param {string} key
	 * @param {string} [defaultValue]
	 */
	const getEnvVar = (key, defaultValue = '') => {
		if (env && typeof env === 'object' && key in env) {
			return env[key];
		}
		return process.env[key] || defaultValue;
	};

	const requireEmailVerification = getEnvVar('REQUIRE_EMAIL_VERIFICATION') === 'true';

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
			requireEmailVerification: requireEmailVerification,
			// @ts-ignore - Better Auth types may not include this in all versions
			sendVerificationEmail: async (/** @type {{ user: any, url: string }} */ { user, url }) => {
				console.log('📧 sendVerificationEmail callback called');
				console.log('User email:', user.email);
				console.log('Verification URL:', url);
				console.log('REQUIRE_EMAIL_VERIFICATION:', requireEmailVerification);
				
				if (requireEmailVerification) {
					try {
						const { sendVerificationEmail } = await import('./email.js');
						const result = await sendVerificationEmail(user.email, url, env);
						
						if (result.success) {
							console.log('✅ Verification email sent successfully:', result.messageId);
						} else {
							console.error('❌ Failed to send verification email:', result.error);
							// In development, log the verification URL as fallback
							if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
								console.log('Verification link (fallback):', url);
							}
						}
					} catch (error) {
						console.error('❌ Error in sendVerificationEmail callback:', error);
						console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
						// In development, log the verification URL as fallback
						if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
							console.log('Verification link (fallback):', url);
						}
					}
				} else {
					console.warn('⚠️ Email verification is disabled (REQUIRE_EMAIL_VERIFICATION is not "true")');
				}
			},
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
		trustedOrigins: [baseUrl],
		hooks: {
			// @ts-ignore - Better Auth types may not include this in all versions
			user: {
				created: {
					before: async (/** @type {any} */ user) => {
						// Validate email domain before user creation
						if (user.email) {
							const emailParts = user.email.toLowerCase().trim().split('@');
							if (emailParts.length !== 2) {
								throw new Error('Invalid email format');
							}

						const domain = emailParts[1];

						// Check if domain is in allowed list
						try {
							const [allowedDomain] = await db
								.select()
								.from(schema.allowedEmailDomains)
								.where(
									and(
										eq(schema.allowedEmailDomains.domain, domain),
										eq(schema.allowedEmailDomains.isActive, true)
									)
								)
								.limit(1);

							if (!allowedDomain) {
								throw new Error(`Email domain "${domain}" is not allowed. Please use one of the supported email providers.`);
							}
					} catch (/** @type {any} */ dbError) {
						// Enhanced error logging for debugging
						console.error("Error querying allowed_email_domains table in auth hook:");
						console.error("Error message:", dbError?.message);
						console.error("Error stack:", dbError?.stack);
						console.error("Error details:", JSON.stringify(dbError, Object.getOwnPropertyNames(dbError)));
						console.error("Domain being checked:", domain);
						console.warn("Allowing user registration to proceed despite domain check failure");
						// Don't throw error - allow registration to proceed
					}
						}

						return user;
					}
				}
			}
		}
	});

	// Cache the instance
	authInstances.set(cacheKey, auth);
	return auth;
}

/** @typedef {ReturnType<typeof createAuth>} Auth */

