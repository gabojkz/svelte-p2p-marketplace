import { redirect, fail } from '@sveltejs/kit';
import { users, userSettings } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
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

	const userId = marketplaceUser[0].id;

	// Get or create user settings
	let settings = await db
		.select()
		.from(userSettings)
		.where(eq(userSettings.userId, userId))
		.limit(1);

	if (settings.length === 0) {
		// Create default settings
		const [newSettings] = await db
			.insert(userSettings)
			.values({
				userId: userId,
				emailNotifications: true,
				pushNotifications: true,
				smsNotifications: false,
				showEmail: false,
				showPhone: false,
				currencyPreference: 'GBP',
				language: 'en',
				timezone: 'UTC'
			})
			.returning();
		settings = [newSettings];
	}

	return {
		session: locals.session,
		user: locals.user,
		marketplaceUser: marketplaceUser[0],
		settings: settings[0]
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	updateProfile: async ({ request, locals }) => {
		if (!locals.session || !locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const db = locals.db;
		if (!db) {
			return fail(500, { error: 'Database not available' });
		}

		const formData = await request.formData();
		const firstName = formData.get('firstName')?.toString().trim();
		const lastName = formData.get('lastName')?.toString().trim();
		const bio = formData.get('bio')?.toString().trim();
		const phone = formData.get('phone')?.toString().trim();
		const locationCity = formData.get('locationCity')?.toString().trim();
		const locationPostcode = formData.get('locationPostcode')?.toString().trim();

		// Get marketplace user
		const marketplaceUser = await db
			.select()
			.from(users)
			.where(eq(users.authUserId, locals.user.id))
			.limit(1);

		if (marketplaceUser.length === 0) {
			return fail(400, { error: 'User profile not found' });
		}

		try {
			await db
				.update(users)
				.set({
					firstName: firstName || null,
					lastName: lastName || null,
					bio: bio || null,
					phone: phone || null,
					locationCity: locationCity || null,
					locationPostcode: locationPostcode || null,
					updatedAt: new Date()
				})
				.where(eq(users.id, marketplaceUser[0].id));

			return { success: true, message: 'Profile updated successfully' };
		} catch (error) {
			console.error('Error updating profile:', error);
			return fail(500, { error: 'Failed to update profile' });
		}
	},

	updateSettings: async ({ request, locals }) => {
		if (!locals.session || !locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const db = locals.db;
		if (!db) {
			return fail(500, { error: 'Database not available' });
		}

		const formData = await request.formData();
		
		// Get marketplace user
		const marketplaceUser = await db
			.select()
			.from(users)
			.where(eq(users.authUserId, locals.user.id))
			.limit(1);

		if (marketplaceUser.length === 0) {
			return fail(400, { error: 'User profile not found' });
		}

		const userId = marketplaceUser[0].id;

		// Get current settings
		const currentSettings = await db
			.select()
			.from(userSettings)
			.where(eq(userSettings.userId, userId))
			.limit(1);

		if (currentSettings.length === 0) {
			return fail(400, { error: 'Settings not found' });
		}

		try {
			await db
				.update(userSettings)
				.set({
					emailNotifications: formData.get('emailNotifications') === 'true',
					pushNotifications: formData.get('pushNotifications') === 'true',
					smsNotifications: formData.get('smsNotifications') === 'true',
					showEmail: formData.get('showEmail') === 'true',
					showPhone: formData.get('showPhone') === 'true',
					currencyPreference: formData.get('currencyPreference')?.toString() || 'GBP',
					language: formData.get('language')?.toString() || 'en',
					timezone: formData.get('timezone')?.toString() || 'UTC',
					updatedAt: new Date()
				})
				.where(eq(userSettings.userId, userId));

			return { success: true, message: 'Settings updated successfully' };
		} catch (error) {
			console.error('Error updating settings:', error);
			return fail(500, { error: 'Failed to update settings' });
		}
	},

	changePassword: async ({ request, locals }) => {
		if (!locals.session || !locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const currentPassword = formData.get('currentPassword')?.toString();
		const newPassword = formData.get('newPassword')?.toString();
		const confirmPassword = formData.get('confirmPassword')?.toString();

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { error: 'All password fields are required' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { error: 'New passwords do not match' });
		}

		if (newPassword.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters' });
		}

		// Note: Password change should be handled by Better Auth
		// This is a placeholder - you'll need to implement the actual password change
		// using Better Auth's password change endpoint
		return fail(501, { error: 'Password change not yet implemented. Please use Better Auth API.' });
	}
};

