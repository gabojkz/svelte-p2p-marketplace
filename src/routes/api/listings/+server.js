import { json, error } from '@sveltejs/kit';
import { listings, users, categories } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { createListingSchema } from '$lib/utils/security-schemas.js';
import { validateRequestBodySafe } from '$lib/utils/api-validation.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
	if (!locals.session || !locals.user) {
		throw error(401, 'Unauthorized');
	}

	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	const body = await request.json();
	
	// Validate and sanitize input using Zod schema
	const validation = validateRequestBodySafe(createListingSchema, body);
	if (!validation.valid) {
		return json(validation.errors, { status: 400 });
	}
	
	// Use validated and sanitized data
	const validatedData = validation.data;

	// Get marketplace user
	const marketplaceUser = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, locals.user.id))
		.limit(1);

	if (marketplaceUser.length === 0) {
		throw error(400, 'User profile not found');
	}

	// Validate category exists (additional check after schema validation)
	const [category] = await db
		.select()
		.from(categories)
		.where(eq(categories.id, validatedData.categoryId))
		.limit(1);

	if (!category) {
		return json({
			error: "Invalid category selected",
			fieldErrors: { categoryId: "The selected category does not exist. Please choose a different category." }
		}, { status: 400 });
	}
	
	// Validate condition for products
	if (validatedData.type === "product" && !validatedData.condition) {
		return json({
			error: "Condition is required for products",
			fieldErrors: { condition: "Please select the condition of your item" }
		}, { status: 400 });
	}

	try {
		// Create listing using validated and sanitized data
		const [newListing] = await db
			.insert(listings)
			.values({
				userId: marketplaceUser[0].id,
				categoryId: validatedData.categoryId,
				subcategoryId: validatedData.subcategoryId || null,
				type: validatedData.type,
				title: validatedData.title, // Already sanitized
				description: validatedData.description, // Already sanitized
				condition: validatedData.condition || null,
				brand: validatedData.brand || null,
				price: validatedData.price.toString(), // Already validated as number
				priceType: validatedData.priceType || "fixed",
				acceptsOffers: validatedData.acceptsOffers || false,
				locationCity: validatedData.locationCity, // Already sanitized
				locationPostcode: validatedData.locationPostcode, // Already validated
				locationLatitude: validatedData.locationLatitude || null,
				locationLongitude: validatedData.locationLongitude || null,
				deliveryCollection: validatedData.deliveryCollection !== false,
				deliveryLocal: validatedData.deliveryLocal || false,
				deliveryShipping: validatedData.deliveryShipping || false,
				status: validatedData.status || "draft",
				publishedAt: validatedData.status === 'active' ? new Date() : null,
				featured: validatedData.featured || false,
				urgent: validatedData.urgent || false
			})
			.returning();

		return json({ success: true, listing: newListing });
	} catch (err) {
		console.error("Error creating listing:", err);
		return json({ error: "Failed to create listing" }, { status: 500 });
	}
}

