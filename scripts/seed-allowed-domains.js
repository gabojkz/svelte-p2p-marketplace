import { createDb } from "../src/lib/server/db.js";
import { allowedEmailDomains } from "../src/lib/server/schema.js";
import { eq } from "drizzle-orm";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5433/marketplace_db";

if (!databaseUrl) {
  console.error("❌ DATABASE_URL environment variable is not set");
  process.exit(1);
}

// List of allowed email domains
const allowedDomains = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "aol.com",
  "outlook.com",
  "comcast.net",
  "icloud.com",
  "msn.com",
  "hotmail.co.uk",
  "sbcglobal.net",
  "live.com",
  "yahoo.co.in",
  "me.com",
  "att.net",
  "mail.ru",
  "bellsouth.net",
  "rediffmail.com",
  "cox.net",
  "yahoo.co.uk",
  "verizon.net",
  "ymail.com",
  "hotmail.it",
  "kw.com",
  "yahoo.com.tw",
  "mac.com",
  "googlemail.com",
  "libero.it",
  "web.de",
  "qq.com",
  "yandex.ru",
  "mail.com",
  "gmx.com",
  "gmx.net",
  "protonmail.com",
  "zoho.com",
  "hey.com",
  "mailfence.com",
  "hanmail.net",
  "uol.com.br",
  "bol.com.br",
  "orange.fr",
  "wanadoo.fr",
  "tiscali.it",
  "virgilio.it",
  "seznam.cz",
  "naver.com",
  "daum.net",
  "163.com",
  "126.com",
  "yeah.net",
  "terra.com",
  "terra.com.br",
  "hotmail.fr",
  "hotmail.es",
  "yahoo.fr",
  "yahoo.es",
  "yahoo.co.jp",
  "yahoo.com.br",
];

async function seedAllowedDomains() {
  const db = createDb(databaseUrl);

  console.log("🌱 Seeding allowed email domains...\n");

  let created = 0;
  let skipped = 0;

  try {
    for (const domain of allowedDomains) {
      // Check if domain already exists
      const [existing] = await db
        .select()
        .from(allowedEmailDomains)
        .where(eq(allowedEmailDomains.domain, domain))
        .limit(1);

      if (existing) {
        // Update if exists but inactive
        if (!existing.isActive) {
          await db
            .update(allowedEmailDomains)
            .set({ isActive: true, updatedAt: new Date() })
            .where(eq(allowedEmailDomains.id, existing.id));
          console.log(`✅ Reactivated: ${domain}`);
          created++;
        } else {
          console.log(`⏭️  Skipped (exists): ${domain}`);
          skipped++;
        }
        continue;
      }

      // Insert new domain
      await db.insert(allowedEmailDomains).values({
        domain: domain.toLowerCase(),
        isActive: true,
      });

      console.log(`✅ Created: ${domain}`);
      created++;
    }

    console.log(`\n✨ Seeding complete!`);
    console.log(`   Created/Reactivated: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total domains: ${allowedDomains.length}`);
  } catch (error) {
    console.error("❌ Error seeding allowed email domains:", error);
    process.exit(1);
  }
}

seedAllowedDomains()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
