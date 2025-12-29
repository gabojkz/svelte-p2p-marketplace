import { redirect } from '@sveltejs/kit';
import { users } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, url }) {
	if (!locals.session || !locals.user) {
		throw redirect(302, '/login');
	}

	const db = locals.db;
	if (!db) {
		return { error: 'Database not available' };
	}

	// Get marketplace user
	const marketplaceUser = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, locals.user.id))
		.limit(1);

	if (marketplaceUser.length === 0) {
		throw redirect(302, '/dashboard?error=profile_required');
	}

	const conversationId = url.searchParams.get('conversation');

	return {
		session: locals.session,
		user: locals.user,
		marketplaceUser: marketplaceUser[0],
		conversationId: conversationId ? Number(conversationId) : null
	};
}

