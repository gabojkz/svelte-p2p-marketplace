import { createDb } from "$lib/server/db.js";
import { user, account, verification } from "$lib/server/schema.js";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { json } from "@sveltejs/kit";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, platform }) {
  try {
    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return json(
        { error: "Token, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const databaseUrl =
      platform?.env?.DATABASE_URL || process.env.DATABASE_URL || "";
    const db = createDb(databaseUrl);

    // Find and validate reset token
    const [verificationRecord] = await db
      .select()
      .from(verification)
      .where(
        and(
          eq(verification.identifier, email.toLowerCase().trim()),
          eq(verification.value, token),
          gt(verification.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!verificationRecord) {
      return json(
        {
          error:
            "Invalid or expired reset token. Please request a new password reset link.",
        },
        { status: 400 }
      );
    }

    // Find user
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email.toLowerCase().trim()))
      .limit(1);

    if (!foundUser) {
      return json({ error: "User not found" }, { status: 404 });
    }

    // Find user's credential account
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

    if (!userAccount) {
      return json(
        { error: "No password account found for this user" },
        { status: 400 }
      );
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update password
    await db
      .update(account)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(account.id, userAccount.id));

    // Delete used verification token
    await db
      .delete(verification)
      .where(eq(verification.id, verificationRecord.id));

    return json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

