import { users, userSettings } from "$lib/server/schema.js";
import { eq } from "drizzle-orm";

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, cookies }) {
	let userLanguage = 'en'; // Default to English
	
	// First, check cookie (works for both logged-in and logged-out users)
	const cookieLanguage = cookies.get('language');
	if (cookieLanguage && ['en', 'es'].includes(cookieLanguage)) {
		userLanguage = cookieLanguage;
	}
	
	// Get user language preference from database if user is logged in
	// This takes precedence over cookie if both exist
	if (locals.user && locals.db) {
		try {
			const marketplaceUser = await locals.db
				.select()
				.from(users)
				.where(eq(users.authUserId, locals.user.id))
				.limit(1);
			
			if (marketplaceUser.length > 0) {
				const settings = await locals.db
					.select()
					.from(userSettings)
					.where(eq(userSettings.userId, marketplaceUser[0].id))
					.limit(1);
				
				if (settings.length > 0 && settings[0].language) {
					userLanguage = settings[0].language;
					// Sync cookie with database value
					if (cookieLanguage !== settings[0].language) {
						cookies.set('language', settings[0].language, {
							path: '/',
							maxAge: 60 * 60 * 24 * 365, // 1 year
							sameSite: 'lax'
						});
					}
				}
			}
		} catch (error) {
			console.warn('Error fetching user language preference:', error);
		}
	}
	
	return {
		session: locals.session,
		user: locals.user,
		userLanguage
	};
}

