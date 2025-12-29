import { createAuth } from '$lib/server/auth.js';
import { createDb } from '$lib/server/db.js';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const databaseUrl = event.platform?.env?.DATABASE_URL || process.env.DATABASE_URL || '';
	const baseUrl = event.url.origin;

	if (databaseUrl) {
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
	}

	return resolve(event);
}

