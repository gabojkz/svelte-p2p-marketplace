import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/marketplace_db';

async function checkDuplicateColumns() {
	const sql = postgres(databaseUrl, {
		max: 1,
		onnotice: () => {}
	});

	try {
		console.log('🔍 Checking for duplicate columns in tables...\n');

		// Get all tables
		const tables = await sql`
			SELECT tablename 
			FROM pg_tables 
			WHERE schemaname = 'public' 
			AND tablename NOT LIKE 'pg_%'
			ORDER BY tablename;
		`;

		let foundDuplicates = false;

		for (const table of tables) {
			// Get all columns for this table
			const columns = await sql`
				SELECT column_name, data_type
				FROM information_schema.columns
				WHERE table_schema = 'public'
				AND table_name = ${table.tablename}
				ORDER BY ordinal_position;
			`;

			// Check for duplicate column names
			const columnNames = columns.map(col => col.column_name);
			const duplicates = columnNames.filter((name, index) => columnNames.indexOf(name) !== index);

			if (duplicates.length > 0) {
				foundDuplicates = true;
				console.log(`⚠️  Table "${table.tablename}" has duplicate columns:`);
				duplicates.forEach(dup => {
					console.log(`   - ${dup}`);
				});
			} else {
				console.log(`✓ Table "${table.tablename}" - OK (${columns.length} columns)`);
			}
		}

		if (!foundDuplicates) {
			console.log('\n✅ No duplicate columns found!');
		} else {
			console.log('\n⚠️  Duplicate columns found! Run "npm run db:reset" to fix.');
		}

		await sql.end();
		process.exit(0);
	} catch (error) {
		console.error('❌ Error checking columns:', error);
		await sql.end().catch(() => {});
		process.exit(1);
	}
}

checkDuplicateColumns();

