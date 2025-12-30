import { createDb } from '../src/lib/server/db.js';
import { user, account } from '../src/lib/server/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/marketplace_db';
const TEST_EMAIL = process.argv[2] || 'robert.wilson@example.com';
const TEST_PASSWORD = process.argv[3] || 'password123';

async function verifyPassword() {
	const db = createDb(databaseUrl);

	try {
		console.log(`🔍 Verifying password for: ${TEST_EMAIL}\n`);

		// Find user by email
		const [authUser] = await db
			.select()
			.from(user)
			.where(eq(user.email, TEST_EMAIL))
			.limit(1);

		if (!authUser) {
			console.error(`❌ User not found: ${TEST_EMAIL}`);
			process.exit(1);
		}

		console.log(`✓ Found user: ${authUser.name} (${authUser.id})`);

		// Find account
		const [userAccount] = await db
			.select()
			.from(account)
			.where(eq(account.userId, authUser.id))
			.limit(1);

		if (!userAccount) {
			console.error(`❌ Account not found for user: ${authUser.id}`);
			console.error('   This user has no password set!');
			process.exit(1);
		}

		console.log(`✓ Found account with provider: ${userAccount.providerId}`);

		if (!userAccount.password) {
			console.error(`❌ No password hash found in account!`);
			process.exit(1);
		}

		console.log(`✓ Password hash exists (length: ${userAccount.password.length})`);
		console.log(`  Hash preview: ${userAccount.password.substring(0, 20)}...`);

		// Check if it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
		const isBcrypt = userAccount.password.startsWith('$2');
		console.log(`  Hash type: ${isBcrypt ? 'bcrypt ✓' : 'NOT bcrypt ✗'}`);

		if (!isBcrypt) {
			console.error('\n❌ Password is NOT hashed with bcrypt!');
			console.error('   Better Auth requires bcrypt hashes.');
			console.error('   Run: npm run db:update-passwords');
			process.exit(1);
		}

		// Test password verification
		console.log(`\n🔐 Testing password verification...`);
		const isValid = await bcrypt.compare(TEST_PASSWORD, userAccount.password);

		if (isValid) {
			console.log(`✅ Password "${TEST_PASSWORD}" is CORRECT!`);
			console.log('\n💡 If login still fails, check:');
			console.log('   1. Better Auth configuration');
			console.log('   2. Session handling');
			console.log('   3. Browser console for errors');
		} else {
			console.log(`❌ Password "${TEST_PASSWORD}" is INCORRECT!`);
			console.log('\n💡 Try:');
			console.log('   1. Run: npm run db:update-passwords');
			console.log('   2. Or run: npm run db:reset (to recreate everything)');
		}

		process.exit(isValid ? 0 : 1);
	} catch (error) {
		console.error('❌ Error verifying password:', error);
		process.exit(1);
	}
}

verifyPassword();

