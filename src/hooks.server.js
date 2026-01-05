import { createAuth } from '$lib/server/auth.js';
import { createDb } from '$lib/server/db.js';
import { users } from '$lib/server/schema.js';
import { eq, sql } from 'drizzle-orm';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const databaseUrl = event.platform?.env?.DATABASE_URL || process.env.DATABASE_URL || '';
	const baseUrl = event.url.origin;

	// Validate database URL before attempting connection
	if (databaseUrl && databaseUrl.trim() !== '') {
		try {
			// Create database connection once per request
			// postgres.js handles connection pooling automatically
			event.locals.db = createDb(databaseUrl);

			const auth = createAuth(databaseUrl, baseUrl);
			const session = await auth.api.getSession({
				headers: event.request.headers
			});

			event.locals.session = session?.session
				? {
						id: session.session.id,
						userId: session.session.userId,
						token: session.session.token,
						expiresAt: session.session.expiresAt
					}
				: null;

			event.locals.user = session?.user
				? {
						id: session.user.id,
						name: session.user.name,
						email: session.user.email,
						emailVerified: session.user.emailVerified,
						image: session.user.image,
						createdAt: session.user.createdAt,
						updatedAt: session.user.updatedAt
					}
				: null;

			// Update lastLoginAt for active users (throttled to once per minute)
			// This helps track online status more accurately
			if (event.locals.user && event.locals.db) {
				try {
					// Get the marketplace user
					const [marketplaceUser] = await event.locals.db
						.select()
						.from(users)
						.where(eq(users.authUserId, event.locals.user.id))
						.limit(1);

					if (marketplaceUser) {
						const now = new Date();
						const lastLogin = marketplaceUser.lastLoginAt ? new Date(marketplaceUser.lastLoginAt) : null;
						
						// Update if lastLoginAt is null or more than 1 minute ago
						// This throttles updates to avoid excessive database writes
						if (!lastLogin || (now.getTime() - lastLogin.getTime()) > 60000) {
							await event.locals.db
								.update(users)
								.set({ 
									lastLoginAt: now,
									updatedAt: now
								})
								.where(eq(users.id, marketplaceUser.id));
						}
					}
				} catch (error) {
					// Silently fail - don't break the request if this update fails
					console.warn('Failed to update lastLoginAt:', error);
				}
			}
		} catch (error) {
			// Log database connection errors but don't break the request
			console.error('Database connection error:', error.message);
			// Set locals to null to prevent further database operations
			event.locals.db = null;
			event.locals.session = null;
			event.locals.user = null;
		}
	} else {
		// No database URL configured - set locals to null
		console.warn('⚠️  DATABASE_URL is not set. Database features will be unavailable.');
		event.locals.db = null;
		event.locals.session = null;
		event.locals.user = null;
	}

	return resolve(event);
}

