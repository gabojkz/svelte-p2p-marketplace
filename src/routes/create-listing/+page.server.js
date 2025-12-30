import { redirect, fail } from "@sveltejs/kit";
import { categories, users, listings } from "$lib/server/schema";
import { eq } from "drizzle-orm";

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  if (!locals.session || !locals.user) {
    throw redirect(302, "/login");
  }

  const db = locals.db;

  const allCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.displayOrder, categories.name);

  // Get marketplace user from auth user
  const marketplaceUser = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, locals.user.id))
    .limit(1);

  if (marketplaceUser.length === 0) {
    throw redirect(302, "/marketplace?error=profile_required");
  }

  return {
    session: locals.session,
    user: locals.user,
    marketplaceUser: marketplaceUser[0],
    categories: allCategories,
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request, locals }) => {
    if (!locals.session || !locals.user) {
      return fail(401, { error: "Unauthorized" });
    }

    const db = locals.db;
    const formData = await request.formData();

    // Get marketplace user
    const marketplaceUser = await db
      .select()
      .from(users)
      .where(eq(users.authUserId, locals.user.id))
      .limit(1);

    if (marketplaceUser.length === 0) {
      return fail(400, { error: "User profile not found" });
    }

    // Validate required fields
    const categoryId = formData.get("categoryId");
    const type = formData.get("type");
    const title = formData.get("title");
    const description = formData.get("description");
    const price = formData.get("price");
    const locationCity = formData.get("locationCity");
    const locationPostcode = formData.get("locationPostcode");

    // Collect missing fields with user-friendly names
    const missingFields = [];
    const fieldErrors = {};

    if (!categoryId) {
      missingFields.push("Category");
      fieldErrors.categoryId = "Please select a category";
    }
    if (!type) {
      missingFields.push("Listing Type");
      fieldErrors.type = "Please select product or service";
    }
    if (!title || title.toString().trim() === "") {
      missingFields.push("Title");
      fieldErrors.title = "Please enter a title for your listing";
    }
    if (!description || description.toString().trim() === "") {
      missingFields.push("Description");
      fieldErrors.description = "Please provide a description";
    }
    if (!price || price.toString().trim() === "") {
      missingFields.push("Price");
      fieldErrors.price = "Please enter a price";
    }
    if (!locationCity || locationCity.toString().trim() === "") {
      missingFields.push("City");
      fieldErrors.locationCity = "Please enter your city";
    }
    if (!locationPostcode || locationPostcode.toString().trim() === "") {
      missingFields.push("Postcode");
      fieldErrors.locationPostcode = "Please enter your postcode";
    }

    // Condition is required for products
    if (type === "product") {
      const condition = formData.get("condition");
      if (!condition || condition.toString().trim() === "") {
        missingFields.push("Condition");
        fieldErrors.condition = "Please select the condition of your item";
      }
    }

    if (missingFields.length > 0) {
      const errorMessage =
        missingFields.length === 1
          ? `Missing required field: ${missingFields[0]}`
          : `Missing required fields: ${missingFields.join(", ")}`;

      return fail(400, {
        error: errorMessage,
        fieldErrors: fieldErrors,
        fields: {
          categoryId: !categoryId,
          type: !type,
          title: !title || title.toString().trim() === "",
          description: !description || description.toString().trim() === "",
          price: !price || price.toString().trim() === "",
          locationCity: !locationCity || locationCity.toString().trim() === "",
          locationPostcode:
            !locationPostcode || locationPostcode.toString().trim() === "",
        },
      });
    }

    // Validate category exists
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, Number(categoryId)))
      .limit(1);

    if (category.length === 0) {
      return fail(400, {
        error: "Invalid category selected",
        fieldErrors: {
          categoryId:
            "The selected category does not exist. Please choose a different category.",
        },
      });
    }

    // Validate price
    const priceNum = parseFloat(price.toString());
    if (isNaN(priceNum)) {
      return fail(400, {
        error: "Invalid price format",
        fieldErrors: { price: "Please enter a valid number for the price" },
      });
    }
    if (priceNum < 0) {
      return fail(400, {
        error: "Price cannot be negative",
        fieldErrors: { price: "Price must be 0 or greater" },
      });
    }

    try {
      // Create listing
      const [newListing] = await db
        .insert(listings)
        .values({
          userId: marketplaceUser[0].id,
          categoryId: Number(categoryId),
          subcategoryId: formData.get("subcategoryId")
            ? Number(formData.get("subcategoryId"))
            : null,
          type: type.toString(),
          title: title.toString().trim(),
          description: description.toString().trim(),
          condition: formData.get("condition")
            ? formData.get("condition").toString()
            : null,
          brand: formData.get("brand")
            ? formData.get("brand").toString().trim()
            : null,
          price: priceNum.toString(),
          priceType: (formData.get("priceType") || "fixed").toString(),
          acceptsOffers: formData.get("acceptsOffers") === "true",
          locationCity: locationCity.toString().trim(),
          locationPostcode: locationPostcode.toString().trim(),
          locationLatitude: formData.get("locationLatitude")
            ? formData.get("locationLatitude").toString()
            : null,
          locationLongitude: formData.get("locationLongitude")
            ? formData.get("locationLongitude").toString()
            : null,
          deliveryCollection: formData.get("deliveryCollection") !== "false",
          deliveryLocal: formData.get("deliveryLocal") === "true",
          deliveryShipping: formData.get("deliveryShipping") === "true",
          status: (formData.get("status") || "active").toString(),
          publishedAt: formData.get("status") === "active" ? new Date() : null,
          featured: formData.get("featured") === "true",
          urgent: formData.get("urgent") === "true",
        })
        .returning();

      // Redirect to marketplace or listing detail page
      throw redirect(303, `/marketplace?created=${newListing.id}`);
    } catch (error) {
      // Re-throw redirect errors (they're not actual errors)
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status >= 300 &&
        error.status < 400
      ) {
        throw error;
      }
      console.error("Error creating listing:", error);
      return fail(500, { error: "Failed to create listing" });
    }
  },
};
