import { json, error } from '@sveltejs/kit';
import { users, userSettings } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals, cookies }) {
	const body = await request.json();
	const { language } = body;

	// Validate language
	if (!language || !['en', 'es'].includes(language)) {
		return json({ error: 'Invalid language. Must be "en" or "es"' }, { status: 400 });
	}

	// If user is logged in, save to database
	if (locals.session && locals.user && locals.db) {
		const db = locals.db;

		// Get marketplace user
		const [marketplaceUser] = await db
			.select()
			.from(users)
			.where(eq(users.authUserId, locals.user.id))
			.limit(1);

		if (marketplaceUser) {
			const userId = marketplaceUser.id;

			// Get or create user settings
			let currentSettings = [];
			try {
				currentSettings = await db
					.select()
					.from(userSettings)
					.where(eq(userSettings.userId, userId))
					.limit(1);
			} catch (err) {
				console.error('Error fetching user settings:', err);
				// Continue to cookie fallback
			}

			if (currentSettings.length === 0) {
				// Create default settings
				try {
					const [newSettings] = await db
						.insert(userSettings)
						.values({
							userId: userId,
							emailNotifications: true,
							pushNotifications: true,
							smsNotifications: false,
							showEmail: false,
							showPhone: false,
							currencyPreference: 'USDT',
							language: language,
							timezone: 'UTC',
						})
						.returning();
					// Also set cookie for immediate use
					cookies.set('language', language, {
						path: '/',
						maxAge: 60 * 60 * 24 * 365, // 1 year
						sameSite: 'lax'
					});
					return json({ success: true, language: newSettings.language });
				} catch (err) {
					console.error('Error creating user settings:', err);
					// Continue to cookie fallback
				}
			} else {
				// Update language in database
				try {
					await db
						.update(userSettings)
						.set({
							language: language,
							updatedAt: new Date(),
						})
						.where(eq(userSettings.userId, userId));
					// Also set cookie for immediate use
					cookies.set('language', language, {
						path: '/',
						maxAge: 60 * 60 * 24 * 365, // 1 year
						sameSite: 'lax'
					});
					return json({ success: true, language });
				} catch (err) {
					console.error('Error updating language:', err);
					// Continue to cookie fallback
				}
			}
		}
	}

	// For non-logged-in users or as fallback, store in cookie
	cookies.set('language', language, {
		path: '/',
		maxAge: 60 * 60 * 24 * 365, // 1 year
		sameSite: 'lax'
	});

	return json({ success: true, language });
}

