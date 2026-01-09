import { createAuth } from '$lib/server/auth.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, platform }) {
	try {
		const databaseUrl = platform?.env?.DATABASE_URL || process.env.DATABASE_URL || '';
		const baseUrl = new URL(request.url).origin;
		const env = platform?.env || null;
		const auth = createAuth(databaseUrl, baseUrl, env);

		return auth.handler(request);
	} catch (error) {
		/** @type {any} */
		const err = error;
		console.error('[Auth API] Error in GET handler:', {
			message: err?.message,
			stack: err?.stack,
			cause: err?.cause,
			details: JSON.stringify(err, Object.getOwnPropertyNames(err))
		});
		return new Response(
			JSON.stringify({ 
				error: 'Internal server error',
				message: err?.message || 'Unknown error'
			}),
			{ 
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, platform }) {
	try {
		const databaseUrl = platform?.env?.DATABASE_URL || process.env.DATABASE_URL || '';
		const baseUrl = new URL(request.url).origin;
		const env = platform?.env || null;
		const auth = createAuth(databaseUrl, baseUrl, env);

		const response = await auth.handler(request);
		
		// Log if response indicates an error
		if (response && response.status >= 400) {
			const responseClone = response.clone();
			try {
				const responseData = await responseClone.json();
				console.error('[Auth API] Error response:', {
					status: response.status,
					data: responseData
				});
			} catch {
				// Response might not be JSON
			}
		}
		
		return response;
	} catch (error) {
		/** @type {any} */
		const err = error;
		console.error('[Auth API] Error in POST handler:', {
			message: err?.message,
			stack: err?.stack,
			cause: err?.cause,
			details: JSON.stringify(err, Object.getOwnPropertyNames(err))
		});
		return new Response(
			JSON.stringify({ 
				error: 'Internal server error',
				message: err?.message || 'Unknown error'
			}),
			{ 
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
}

