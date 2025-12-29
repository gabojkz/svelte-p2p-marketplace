import { json, error } from '@sveltejs/kit';
import { listings, users, categories } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

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

	// Get marketplace user
	const marketplaceUser = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, locals.user.id))
		.limit(1);

	if (marketplaceUser.length === 0) {
		throw error(400, 'User profile not found');
	}

	// Validate required fields
	const missingFields = [];
	const fieldErrors = {};

	if (!body.categoryId) {
		missingFields.push("Category");
		fieldErrors.categoryId = "Please select a category";
	}
	if (!body.type) {
		missingFields.push("Listing Type");
		fieldErrors.type = "Please select product or service";
	}
	if (!body.title || body.title.trim() === "") {
		missingFields.push("Title");
		fieldErrors.title = "Please enter a title for your listing";
	}
	if (!body.description || body.description.trim() === "") {
		missingFields.push("Description");
		fieldErrors.description = "Please provide a description";
	}
	if (!body.price || body.price.toString().trim() === "") {
		missingFields.push("Price");
		fieldErrors.price = "Please enter a price";
	}
	if (!body.locationCity || body.locationCity.trim() === "") {
		missingFields.push("City");
		fieldErrors.locationCity = "Please enter your city";
	}
	if (!body.locationPostcode || body.locationPostcode.trim() === "") {
		missingFields.push("Postcode");
		fieldErrors.locationPostcode = "Please enter your postcode";
	}

	if (body.type === "product" && !body.condition) {
		missingFields.push("Condition");
		fieldErrors.condition = "Please select the condition of your item";
	}

	if (missingFields.length > 0) {
		const errorMessage = missingFields.length === 1
			? `Missing required field: ${missingFields[0]}`
			: `Missing required fields: ${missingFields.join(", ")}`;
		
		return json({
			error: errorMessage,
			fieldErrors
		}, { status: 400 });
	}

	// Validate price
	const priceNum = parseFloat(body.price);
	if (isNaN(priceNum)) {
		return json({
			error: "Invalid price format",
			fieldErrors: { price: "Please enter a valid number for the price" }
		}, { status: 400 });
	}
	if (priceNum < 0) {
		return json({
			error: "Price cannot be negative",
			fieldErrors: { price: "Price must be 0 or greater" }
		}, { status: 400 });
	}

	// Validate category exists
	const [category] = await db
		.select()
		.from(categories)
		.where(eq(categories.id, Number(body.categoryId)))
		.limit(1);

	if (!category) {
		return json({
			error: "Invalid category selected",
			fieldErrors: { categoryId: "The selected category does not exist. Please choose a different category." }
		}, { status: 400 });
	}

	try {
		// Create listing
		const [newListing] = await db
			.insert(listings)
			.values({
				userId: marketplaceUser[0].id,
				categoryId: Number(body.categoryId),
				subcategoryId: body.subcategoryId ? Number(body.subcategoryId) : null,
				type: body.type,
				title: body.title.trim(),
				description: body.description.trim(),
				condition: body.condition || null,
				brand: body.brand ? body.brand.trim() : null,
				price: priceNum.toString(),
				priceType: body.priceType || "fixed",
				acceptsOffers: body.acceptsOffers === true,
				locationCity: body.locationCity.trim(),
				locationPostcode: body.locationPostcode.trim(),
				locationLatitude: body.locationLatitude || null,
				locationLongitude: body.locationLongitude || null,
				deliveryCollection: body.deliveryCollection !== false,
				deliveryLocal: body.deliveryLocal === true,
				deliveryShipping: body.deliveryShipping === true,
				status: body.status || "draft",
				publishedAt: body.status === 'active' ? new Date() : null,
				featured: body.featured === true,
				urgent: body.urgent === true
			})
			.returning();

		return json({ success: true, listing: newListing });
	} catch (err) {
		console.error("Error creating listing:", err);
		return json({ error: "Failed to create listing" }, { status: 500 });
	}
}

