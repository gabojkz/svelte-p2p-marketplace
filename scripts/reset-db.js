import { createDb } from '../src/lib/server/db.js';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/marketplace_db';

async function resetDatabase() {
	console.log('🔄 Resetting database...\n');

	// Create a direct postgres connection for dropping tables
	const sql = postgres(databaseUrl, {
		max: 1,
		onnotice: () => {} // Suppress notices
	});

	try {
		console.log('🗑️  Step 1: Dropping all tables...');

		// Get all table names from public schema
		const tables = await sql`
			SELECT tablename 
			FROM pg_tables 
			WHERE schemaname = 'public' 
			AND tablename NOT LIKE 'pg_%'
			ORDER BY tablename;
		`;

		if (tables.length === 0) {
			console.log('   No tables to drop.');
		} else {
			// Drop all tables with CASCADE to handle dependencies
			for (const table of tables) {
				try {
					await sql.unsafe(`DROP TABLE IF EXISTS "${table.tablename}" CASCADE;`);
					console.log(`   ✓ Dropped table: ${table.tablename}`);
				} catch (err) {
					console.warn(`   ⚠️  Could not drop ${table.tablename}:`, err.message);
				}
			}
		}

		console.log('\n🗑️  Step 2: Dropping all enum types...');

		// Get all enum types
		const enums = await sql`
			SELECT typname 
			FROM pg_type 
			WHERE typtype = 'e' 
			AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
			ORDER BY typname;
		`;

		if (enums.length === 0) {
			console.log('   No enum types to drop.');
		} else {
			// Drop all enum types
			for (const enumType of enums) {
				try {
					await sql.unsafe(`DROP TYPE IF EXISTS "public"."${enumType.typname}" CASCADE;`);
					console.log(`   ✓ Dropped enum: ${enumType.typname}`);
				} catch (err) {
					console.warn(`   ⚠️  Could not drop ${enumType.typname}:`, err.message);
				}
			}
		}

		console.log('\n🗑️  Step 3: Dropping all sequences...');

		// Drop all sequences (they might be left behind)
		const sequences = await sql`
			SELECT sequence_name 
			FROM information_schema.sequences 
			WHERE sequence_schema = 'public'
			ORDER BY sequence_name;
		`;

		if (sequences.length === 0) {
			console.log('   No sequences to drop.');
		} else {
			for (const seq of sequences) {
				try {
					await sql.unsafe(`DROP SEQUENCE IF EXISTS "public"."${seq.sequence_name}" CASCADE;`);
					console.log(`   ✓ Dropped sequence: ${seq.sequence_name}`);
				} catch (err) {
					console.warn(`   ⚠️  Could not drop ${seq.sequence_name}:`, err.message);
				}
			}
		}

		// Drop drizzle migrations table if it exists
		try {
			await sql.unsafe(`DROP TABLE IF EXISTS "drizzle"."__drizzle_migrations" CASCADE;`);
			console.log('   ✓ Dropped drizzle migrations table');
		} catch (err) {
			// Ignore if it doesn't exist
		}

		// Drop drizzle schema if it exists
		try {
			await sql.unsafe(`DROP SCHEMA IF EXISTS "drizzle" CASCADE;`);
			console.log('   ✓ Dropped drizzle schema');
		} catch (err) {
			// Ignore if it doesn't exist
		}

		await sql.end();
		console.log('\n✅ Database wiped clean!\n');

		console.log('📦 Step 4: Creating tables (db:push)...');
		const { execSync } = await import('child_process');
		execSync('npm run db:push', { stdio: 'inherit' });

		console.log('\n🌱 Step 5: Seeding data...');
		execSync('npm run db:seed:all', { stdio: 'inherit' });

		console.log('\n✨ Database reset complete!');
		console.log('\n🔑 Login Credentials:');
		console.log('   Email: Any user email from the seed data');
		console.log('   Password: password123');
		process.exit(0);
	} catch (error) {
		console.error('❌ Error resetting database:', error);
		await sql.end().catch(() => {});
		process.exit(1);
	}
}

resetDatabase();

