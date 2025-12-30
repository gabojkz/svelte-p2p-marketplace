import { createDb } from '../src/lib/server/db.js';
import { account } from '../src/lib/server/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/marketplace_db';
const NEW_PASSWORD = 'password123';

// Hash password using bcrypt (Blowfish) - matches BetterAuth configuration
async function hashPassword(password) {
	const saltRounds = 10;
	return await bcrypt.hash(password, saltRounds);
}

async function updatePasswords() {
	const db = createDb(databaseUrl);

	try {
		console.log('🔑 Updating all user passwords to:', NEW_PASSWORD);

		// Get all accounts with credentials
		const allAccounts = await db
			.select()
			.from(account)
			.where(eq(account.providerId, 'credential'));

		console.log(`Found ${allAccounts.length} accounts to update...`);

		// Hash the new password using scrypt (Better Auth default)
		const hashedPassword = await hashPassword(NEW_PASSWORD);

		let updated = 0;
		for (const acc of allAccounts) {
			await db
				.update(account)
				.set({ password: hashedPassword })
				.where(eq(account.id, acc.id));
			
			updated++;
			console.log(`✅ Updated password for account: ${acc.userId}`);
		}

		console.log(`\n✨ Successfully updated ${updated} passwords!`);
		console.log(`\n🔑 New password for all users: ${NEW_PASSWORD}`);
		process.exit(0);
	} catch (error) {
		console.error('❌ Error updating passwords:', error);
		process.exit(1);
	}
}

updatePasswords();

