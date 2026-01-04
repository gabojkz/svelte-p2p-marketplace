import { json } from "@sveltejs/kit";
import { allowedEmailDomains } from "$lib/server/schema.js";
import { eq, and } from "drizzle-orm";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
  const db = locals.db;

  if (!db) {
    return json({ error: "Database not available" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return json({ error: "Email is required" }, { status: 400 });
    }

    // Extract domain from email
    const emailParts = email.toLowerCase().trim().split("@");
    if (emailParts.length !== 2) {
      return json({
        valid: false,
        error: "Invalid email format",
      });
    }

    const domain = emailParts[1];
    console.log({ domain });

    // Check if domain is in allowed list
    let allowedDomain = null;
    try {
      [allowedDomain] = await db
        .select()
        .from(allowedEmailDomains)
        .where(
          and(
            eq(allowedEmailDomains.domain, domain),
            eq(allowedEmailDomains.isActive, true),
          ),
        )
        .limit(1);
    } catch (dbError) {
      // If table doesn't exist or query fails, log but allow registration to proceed
      // This prevents blocking users if the allowed domains table isn't set up yet
      console.error("Error querying allowed_email_domains table:", dbError);
      console.warn("Allowing email registration to proceed despite domain check failure");
      
      // Return valid: true to not block registration
      // In production, you should ensure the table exists and is seeded
      return json({
        valid: true,
        domain: domain,
        warning: "Domain validation temporarily unavailable",
      });
    }

    if (allowedDomain) {
      return json({
        valid: true,
        domain: domain,
      });
    } else {
      return json({
        valid: false,
        error: `Email domain "${domain}" is not allowed. Please use one of the supported email providers.`,
        domain: domain,
      });
    }
  } catch (error) {
    console.error("Error validating email domain:", error);
    // Don't block registration if validation fails
    return json(
      {
        valid: true,
        warning: "Email validation temporarily unavailable",
      },
      { status: 200 },
    );
  }
}
