import { createAuth } from '$lib/server/auth.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, platform }) {
	const databaseUrl = platform?.env?.DATABASE_URL || process.env.DATABASE_URL || '';
	const baseUrl = new URL(request.url).origin;
	const auth = createAuth(databaseUrl, baseUrl);

	return auth.handler(request);
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, platform }) {
	const databaseUrl = platform?.env?.DATABASE_URL || process.env.DATABASE_URL || '';
	const baseUrl = new URL(request.url).origin;
	const auth = createAuth(databaseUrl, baseUrl);

	return auth.handler(request);
}

