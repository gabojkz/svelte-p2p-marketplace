import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/marketplace_db';

async function addSocialMediaColumns() {
  console.log('🔄 Adding social media columns to user_settings table...\n');

  const sql = postgres(databaseUrl, { max: 1 });

  try {
    // Add columns one by one with IF NOT EXISTS
    console.log('Adding tiktok column...');
    await sql`ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "tiktok" varchar(100);`;
    console.log('✓ tiktok column added');

    console.log('Adding instagram column...');
    await sql`ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "instagram" varchar(100);`;
    console.log('✓ instagram column added');

    console.log('Adding whatsapp column...');
    await sql`ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "whatsapp" varchar(20);`;
    console.log('✓ whatsapp column added');

    console.log('Adding telegram column...');
    await sql`ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "telegram" varchar(100);`;
    console.log('✓ telegram column added');

    await sql.end();
    console.log('\n✅ All social media columns added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    await sql.end().catch(() => {});
    process.exit(1);
  }
}

addSocialMediaColumns();

