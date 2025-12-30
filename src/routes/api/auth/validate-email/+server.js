import { json } from '@sveltejs/kit';
import { allowedEmailDomains } from '$lib/server/schema.js';
import { eq, and } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
	const db = locals.db;
	
	if (!db) {
		return json({ error: 'Database not available' }, { status: 500 });
	}

	try {
		const body = await request.json();
		const { email } = body;

		if (!email || typeof email !== 'string') {
			return json({ error: 'Email is required' }, { status: 400 });
		}

		// Extract domain from email
		const emailParts = email.toLowerCase().trim().split('@');
		if (emailParts.length !== 2) {
			return json({ 
				valid: false, 
				error: 'Invalid email format' 
			});
		}

		const domain = emailParts[1];

		// Check if domain is in allowed list
		const [allowedDomain] = await db
			.select()
			.from(allowedEmailDomains)
			.where(
				and(
					eq(allowedEmailDomains.domain, domain),
					eq(allowedEmailDomains.isActive, true)
				)
			)
			.limit(1);

		if (allowedDomain) {
			return json({ 
				valid: true,
				domain: domain
			});
		} else {
			return json({ 
				valid: false,
				error: `Email domain "${domain}" is not allowed. Please use one of the supported email providers.`,
				domain: domain
			});
		}
	} catch (error) {
		console.error('Error validating email domain:', error);
		return json({ 
			error: 'Failed to validate email domain' 
		}, { status: 500 });
	}
}

