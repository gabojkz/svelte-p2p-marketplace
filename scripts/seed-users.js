import { createDb } from '../src/lib/server/db.js';
import { user, users, account } from '../src/lib/server/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

// Hash password using bcrypt (Blowfish) - matches BetterAuth configuration
async function hashPassword(password) {
	const saltRounds = 10;
	return await bcrypt.hash(password, saltRounds);
}

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/marketplace_db';

// Default password for all test users (development only!)
const DEFAULT_PASSWORD = 'password123';

// Sample users data
const sampleUsers = [
	{
		name: 'Sarah Johnson',
		email: 'sarah.johnson@example.com',
		username: 'sarahj',
		firstName: 'Sarah',
		lastName: 'Johnson',
		locationCity: 'Newcastle',
		locationPostcode: 'NE1 1AA',
		bio: 'Tech enthusiast and gadget collector. Always looking for the latest electronics!'
	},
	{
		name: 'Michael Chen',
		email: 'michael.chen@example.com',
		username: 'michaelc',
		firstName: 'Michael',
		lastName: 'Chen',
		locationCity: 'Gateshead',
		locationPostcode: 'NE8 1AB',
		bio: 'Car enthusiast and mechanic. Selling quality vehicles and parts.'
	},
	{
		name: 'Emma Williams',
		email: 'emma.williams@example.com',
		username: 'emmaw',
		firstName: 'Emma',
		lastName: 'Williams',
		locationCity: 'Sunderland',
		locationPostcode: 'SR1 1AA',
		bio: 'Fashion lover and style consultant. Curated collection of designer items.'
	},
	{
		name: 'David Brown',
		email: 'david.brown@example.com',
		username: 'davidb',
		firstName: 'David',
		lastName: 'Brown',
		locationCity: 'Durham',
		locationPostcode: 'DH1 1AA',
		bio: 'Home improvement specialist. Quality furniture and appliances.'
	},
	{
		name: 'Lisa Anderson',
		email: 'lisa.anderson@example.com',
		username: 'lisaa',
		firstName: 'Lisa',
		lastName: 'Anderson',
		locationCity: 'Newcastle',
		locationPostcode: 'NE2 1AA',
		bio: 'Fitness coach and sports equipment seller. Helping you stay active!'
	},
	{
		name: 'James Taylor',
		email: 'james.taylor@example.com',
		username: 'jamest',
		firstName: 'James',
		lastName: 'Taylor',
		locationCity: 'Jesmond',
		locationPostcode: 'NE2 2AA',
		bio: 'Professional web developer. Offering development services and tech consulting.'
	},
	{
		name: 'Sophie Martinez',
		email: 'sophie.martinez@example.com',
		username: 'sophiem',
		firstName: 'Sophie',
		lastName: 'Martinez',
		locationCity: 'Tynemouth',
		locationPostcode: 'NE30 1AA',
		bio: 'Beauty and wellness expert. Quality products and services.'
	},
	{
		name: 'Robert Wilson',
		email: 'robert.wilson@example.com',
		username: 'robertw',
		firstName: 'Robert',
		lastName: 'Wilson',
		locationCity: 'Hexham',
		locationPostcode: 'NE46 1AA',
		bio: 'Motorcycle enthusiast. Selling bikes and accessories.'
	},
	{
		name: 'Olivia Davis',
		email: 'olivia.davis@example.com',
		username: 'oliviad',
		firstName: 'Olivia',
		lastName: 'Davis',
		locationCity: 'Newcastle',
		locationPostcode: 'NE3 1AA',
		bio: 'Interior designer. Beautiful home goods and decor.'
	},
	{
		name: 'Thomas Moore',
		email: 'thomas.moore@example.com',
		username: 'thomasm',
		firstName: 'Thomas',
		lastName: 'Moore',
		locationCity: 'Gateshead',
		locationPostcode: 'NE8 2AA',
		bio: 'Qualified electrician. Professional home improvement services.'
	},
	{
		name: 'Charlotte White',
		email: 'charlotte.white@example.com',
		username: 'charlottew',
		firstName: 'Charlotte',
		lastName: 'White',
		locationCity: 'Newcastle',
		locationPostcode: 'NE1 2AA',
		bio: 'Music teacher and piano instructor. Offering lessons and selling instruments.'
	},
	{
		name: 'Daniel Garcia',
		email: 'daniel.garcia@example.com',
		username: 'danielg',
		firstName: 'Daniel',
		lastName: 'Garcia',
		locationCity: 'Newcastle',
		locationPostcode: 'NE1 3AA',
		bio: 'Gaming PC builder and tech specialist. Custom builds and components.'
	},
	{
		name: 'Amelia Rodriguez',
		email: 'amelia.rodriguez@example.com',
		username: 'ameliar',
		firstName: 'Amelia',
		lastName: 'Rodriguez',
		locationCity: 'Newcastle',
		locationPostcode: 'NE1 4AA',
		bio: 'Luxury goods collector. Authentic designer items and vintage pieces.'
	},
	{
		name: 'Christopher Lee',
		email: 'christopher.lee@example.com',
		username: 'christopherl',
		firstName: 'Christopher',
		lastName: 'Lee',
		locationCity: 'Newcastle',
		locationPostcode: 'NE1 5AA',
		bio: 'Watch collector and horologist. Rare timepieces and vintage watches.'
	},
	{
		name: 'Isabella Harris',
		email: 'isabella.harris@example.com',
		username: 'isabellah',
		firstName: 'Isabella',
		lastName: 'Harris',
		locationCity: 'Durham',
		locationPostcode: 'DH1 2AA',
		bio: 'Local delivery service provider. Fast and reliable courier services.'
	}
];

async function seedUsers() {
	const db = createDb(databaseUrl);

	try {
		console.log('🌱 Seeding users...');

		let created = 0;
		let skipped = 0;

		for (const userData of sampleUsers) {
			// Check if user already exists
			const existingAuthUser = await db
				.select()
				.from(user)
				.where(eq(user.email, userData.email))
				.limit(1);

			if (existingAuthUser.length > 0) {
				// Check if marketplace user exists (by authUserId)
				const existingMarketplaceUser = await db
					.select()
					.from(users)
					.where(eq(users.authUserId, existingAuthUser[0].id))
					.limit(1);

				if (existingMarketplaceUser.length > 0) {
					console.log(`⏭️  Skipped (exists): ${userData.email}`);
					skipped++;
					continue;
				}

				// Check if account exists, if not create one with password
				const existingAccount = await db
					.select()
					.from(account)
					.where(eq(account.userId, existingAuthUser[0].id))
					.limit(1);

				if (existingAccount.length === 0) {
					// Create Better Auth account with password
					const accountId = randomUUID();
					const passwordHash = await hashPassword(DEFAULT_PASSWORD);
					
					await db.insert(account).values({
						id: accountId,
						accountId: accountId,
						providerId: 'credential',
						userId: existingAuthUser[0].id,
						password: passwordHash
					});
					
					console.log(`   Added password to existing auth user - Password: ${DEFAULT_PASSWORD}`);
				}

				// Create marketplace user for existing auth user
				await db.insert(users).values({
					authUserId: existingAuthUser[0].id,
					username: userData.username,
					firstName: userData.firstName,
					lastName: userData.lastName,
					locationCity: userData.locationCity,
					locationPostcode: userData.locationPostcode,
					bio: userData.bio,
					isActive: true,
					locationLatitude: (54.9783 + (Math.random() - 0.5) * 0.1).toString(),
					locationLongitude: (-1.6178 + (Math.random() - 0.5) * 0.1).toString()
				});

				console.log(`✅ Created marketplace user: ${userData.username} - Password: ${DEFAULT_PASSWORD}`);
				created++;
				continue;
			}

			// Create both auth user and marketplace user
			const authUserId = randomUUID();
			const accountId = randomUUID();

			// Hash password using scrypt (Better Auth default)
			const passwordHash = await hashPassword(DEFAULT_PASSWORD);

			// Create auth user
			await db.insert(user).values({
				id: authUserId,
				name: userData.name,
				email: userData.email,
				emailVerified: true
			});

			// Create Better Auth account with password
			await db.insert(account).values({
				id: accountId,
				accountId: accountId,
				providerId: 'credential',
				userId: authUserId,
				password: passwordHash
			});

			// Create marketplace user
			await db.insert(users).values({
				authUserId: authUserId,
				username: userData.username,
				firstName: userData.firstName,
				lastName: userData.lastName,
				locationCity: userData.locationCity,
				locationPostcode: userData.locationPostcode,
				bio: userData.bio,
				isActive: true,
				locationLatitude: (54.9783 + (Math.random() - 0.5) * 0.1).toString(),
				locationLongitude: (-1.6178 + (Math.random() - 0.5) * 0.1).toString()
			});

			console.log(`✅ Created user: ${userData.username} (${userData.email}) - Password: ${DEFAULT_PASSWORD}`);
			created++;
		}

		// Show summary
		const totalUsers = await db.select().from(users);
		const totalAuthUsers = await db.select().from(user);
		
		console.log(`\n📊 Summary:`);
		console.log(`   Created: ${created}`);
		console.log(`   Skipped: ${skipped}`);
		console.log(`   Total marketplace users: ${totalUsers.length}`);
		console.log(`   Total auth users: ${totalAuthUsers.length}`);
		console.log(`\n🔑 Login Credentials:`);
		console.log(`   Password for all test users: ${DEFAULT_PASSWORD}`);
		console.log(`   Example: ${sampleUsers[0]?.email} / ${DEFAULT_PASSWORD}`);

		console.log('\n✨ Users seeded successfully!');
		process.exit(0);
	} catch (error) {
		console.error('❌ Error seeding users:', error);
		process.exit(1);
	}
}

seedUsers();

