import { json } from '@sveltejs/kit';
import { createDb } from '$lib/server/db.js';
import { allowedEmailDomains, user } from '$lib/server/schema.js';
import { eq, sql } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function GET({ platform, url }) {
	// Only allow in development or with a secret key for security
	const secretKey = url.searchParams.get('key');
	if (process.env.NODE_ENV === 'production' && secretKey !== process.env.DB_TEST_SECRET) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const databaseUrl = platform?.env?.DATABASE_URL || process.env.DATABASE_URL || '';
	
	const results = {
		hasDatabaseUrl: !!databaseUrl,
		databaseUrlLength: databaseUrl?.length || 0,
		databaseUrlPreview: databaseUrl ? `${databaseUrl.substring(0, 10)}...${databaseUrl.substring(databaseUrl.length - 10)}` : 'N/A',
		isNeon: databaseUrl.includes('neon.tech'),
		isLocal: databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1'),
		tests: []
	};

	if (!databaseUrl) {
		return json({
			...results,
			error: 'DATABASE_URL environment variable is not set'
		}, { status: 500 });
	}

	try {
		// Test 1: Create database connection
		let db;
		try {
			db = createDb(databaseUrl);
			results.tests.push({
				name: 'Database connection creation',
				status: 'success',
				message: 'Database connection created successfully'
			});
		} catch (error) {
			results.tests.push({
				name: 'Database connection creation',
				status: 'error',
				message: error?.message || 'Unknown error',
				error: JSON.stringify(error, Object.getOwnPropertyNames(error))
			});
			return json(results, { status: 500 });
		}

		// Test 2: Simple query to check connectivity
		try {
			const testQuery = await db.execute(sql`SELECT 1 as test`);
			results.tests.push({
				name: 'Simple SQL query',
				status: 'success',
				message: 'Query executed successfully',
				result: Array.isArray(testQuery) ? testQuery : 'Query result received'
			});
		} catch (error) {
			results.tests.push({
				name: 'Simple SQL query',
				status: 'error',
				message: error?.message || 'Unknown error',
				error: JSON.stringify(error, Object.getOwnPropertyNames(error))
			});
		}

		// Test 2.5: Check if user table exists and is accessible
		try {
			const userCount = await db.select().from(user).limit(1);
			results.tests.push({
				name: 'Query user table (Better Auth)',
				status: 'success',
				message: 'User table exists and is accessible',
				result: `Table accessible, sample count: ${userCount.length}`
			});
		} catch (error) {
			results.tests.push({
				name: 'Query user table (Better Auth)',
				status: 'error',
				message: error?.message || 'Unknown error',
				error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
				stack: error?.stack,
				diagnosis: 'The user table might not exist. Run migrations: npm run db:push'
			});
		}

		// Test 3: Query allowed_email_domains table
		try {
			const domains = await db
				.select()
				.from(allowedEmailDomains)
				.where(eq(allowedEmailDomains.isActive, true))
				.limit(5);
			
			results.tests.push({
				name: 'Query allowed_email_domains table',
				status: 'success',
				message: `Found ${domains.length} active domains`,
				result: domains
			});
		} catch (error) {
			results.tests.push({
				name: 'Query allowed_email_domains table',
				status: 'error',
				message: error?.message || 'Unknown error',
				error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
				stack: error?.stack
			});
		}

		// Test 4: Specific domain query (the one that's failing)
		try {
			const [domain] = await db
				.select()
				.from(allowedEmailDomains)
				.where(eq(allowedEmailDomains.domain, 'gmail.com'))
				.limit(1);
			
			results.tests.push({
				name: 'Query specific domain (gmail.com)',
				status: 'success',
				message: domain ? 'Domain found' : 'Domain not found',
				result: domain
			});
		} catch (error) {
			results.tests.push({
				name: 'Query specific domain (gmail.com)',
				status: 'error',
				message: error?.message || 'Unknown error',
				error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
				stack: error?.stack
			});
		}

		return json(results);
	} catch (error) {
		return json({
			...results,
			error: error?.message || 'Unknown error',
			errorDetails: JSON.stringify(error, Object.getOwnPropertyNames(error))
		}, { status: 500 });
	}
}

