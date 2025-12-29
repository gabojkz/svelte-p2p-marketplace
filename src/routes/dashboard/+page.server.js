import { redirect } from '@sveltejs/kit';
import { users } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	if (!locals.session || !locals.user) {
		throw redirect(302, '/login');
	}

	const db = locals.db;

	// Check if marketplace user exists
	let marketplaceUser = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, locals.user.id))
		.limit(1);

	// If no marketplace user exists, create one automatically
	if (marketplaceUser.length === 0) {
		// Generate a username from email or name
		const username = locals.user.name
			?.toLowerCase()
			.replace(/\s+/g, '')
			.replace(/[^a-z0-9]/g, '') || 
			locals.user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

		// Check if username is unique, if not append random string
		let finalUsername = username;
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.username, finalUsername))
			.limit(1);

		if (existingUser.length > 0) {
			finalUsername = `${username}${Math.floor(Math.random() * 10000)}`;
		}

		// Split name into first and last
		const nameParts = locals.user.name?.split(' ') || [];
		const firstName = nameParts[0] || '';
		const lastName = nameParts.slice(1).join(' ') || '';

		// Create marketplace user profile
		const [newMarketplaceUser] = await db
			.insert(users)
			.values({
				authUserId: locals.user.id,
				email: locals.user.email,
				passwordHash: 'auto_created', // Placeholder, not used for auth
				username: finalUsername,
				firstName: firstName,
				lastName: lastName,
				emailVerified: locals.user.emailVerified || false,
				isActive: true
			})
			.returning();

		marketplaceUser = [newMarketplaceUser];
	}

	return {
		session: locals.session,
		user: locals.user,
		marketplaceUser: marketplaceUser[0]
	};
}

