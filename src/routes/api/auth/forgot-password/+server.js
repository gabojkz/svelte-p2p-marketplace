import { createDb } from "$lib/server/db.js";
import { user, account, verification } from "$lib/server/schema.js";
import { eq, and, gt } from "drizzle-orm";
import { randomBytes } from "crypto";
import { json } from "@sveltejs/kit";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, platform }) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return json({ error: "Email is required" }, { status: 400 });
    }

    const databaseUrl =
      platform?.env?.DATABASE_URL || process.env.DATABASE_URL || "";
    const baseUrl = new URL(request.url).origin;
    const db = createDb(databaseUrl);

    // Find user by email
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email.toLowerCase().trim()))
      .limit(1);

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (foundUser) {
      // Check if user has a password account (not just OAuth)
      const [userAccount] = await db
        .select()
        .from(account)
        .where(
          and(
            eq(account.userId, foundUser.id),
            eq(account.providerId, "credential")
          )
        )
        .limit(1);

      if (userAccount && userAccount.password) {
        // Generate reset token
        const resetToken = randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

        // Store reset token in verification table
        // Better Auth uses verification table for password resets
        await db.insert(verification).values({
          id: randomBytes(16).toString("hex"),
          identifier: foundUser.email,
          value: resetToken,
          expiresAt: expiresAt,
        });

        // In a real app, you would send an email here with the reset link
        // For now, we'll just log it (in development) or return success
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(foundUser.email)}`;

        // TODO: Send email with reset link
        // await sendPasswordResetEmail(foundUser.email, resetUrl);

        // In development, log the reset URL (remove in production)
        if (process.env.NODE_ENV === "development") {
          console.log("Password reset link:", resetUrl);
        }
      }
    }

    // Always return success to prevent email enumeration
    return json({
      success: true,
      message:
        "If an account with that email exists, we've sent you a password reset link.",
    });
  } catch (error) {
    console.error("Error processing password reset request:", error);
    return json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

