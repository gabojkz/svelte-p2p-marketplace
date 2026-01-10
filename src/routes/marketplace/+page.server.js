import { categories, listings, users, listingImages } from '$lib/server/schema.js';
import { eq, and, or, like, sql, desc, asc, gte, lte, inArray } from 'drizzle-orm';
import { getR2PublicUrl } from '$lib/server/r2.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, url, platform }) {
	const db = locals.db;

	// If database is not available, return empty data instead of throwing
	if (!db) {
		console.warn('Database connection not available - returning empty marketplace data');
		return {
			listings: [],
			categories: [],
			totalCount: 0,
			currentPage: 1,
			totalPages: 0,
			marketplaceUser: null,
			filters: {
				searchQuery: '',
				categorySlug: '',
				location: '',
				radius: '',
				sortBy: 'newest',
				type: '',
				minPrice: '',
				maxPrice: '',
				condition: ''
			}
		};
	}

	// Get marketplace user if logged in
	let marketplaceUser = null;
	if (locals.session && locals.user) {
		const [userProfile] = await db
			.select()
			.from(users)
			.where(eq(users.authUserId, locals.user.id))
			.limit(1);
		marketplaceUser = userProfile || null;
	}

	try {
		// Get query parameters
		const searchQuery = url.searchParams.get('q') || '';
		const categorySlug = url.searchParams.get('category') || '';
		const location = url.searchParams.get('location') || '';
		const radius = url.searchParams.get('radius') || '';
		const sortBy = url.searchParams.get('sort') || 'newest';
		const type = url.searchParams.get('type') || '';
		const minPrice = url.searchParams.get('minPrice') || '';
		const maxPrice = url.searchParams.get('maxPrice') || '';
		const condition = url.searchParams.get('condition') || '';
		const page = parseInt(url.searchParams.get('page') || '1', 10);
		const limit = 20;
		const offset = (page - 1) * limit;

		// Get user's location coordinates if available (for radius filtering)
		let userLat = null;
		let userLon = null;
		if (marketplaceUser && marketplaceUser.locationLatitude && marketplaceUser.locationLongitude) {
			userLat = parseFloat(marketplaceUser.locationLatitude);
			userLon = parseFloat(marketplaceUser.locationLongitude);
		}

		// Build where conditions
		const conditions = [eq(listings.status, 'active')];

		// Search query
		if (searchQuery) {
			const searchCondition = or(
				like(listings.title, `%${searchQuery}%`),
				like(listings.description, `%${searchQuery}%`)
			);
			if (searchCondition) {
				conditions.push(searchCondition);
			}
		}

		// Type filter
		if (type && type !== 'all') {
			conditions.push(eq(listings.type, type));
		}

		// Category filter
		let categoryId = null;
		if (categorySlug) {
			const [category] = await db
				.select()
				.from(categories)
				.where(eq(categories.slug, categorySlug))
				.limit(1);
			
			if (category) {
				categoryId = category.id;
				conditions.push(eq(listings.categoryId, categoryId));
			}
		}

		// Price range filter
		if (minPrice) {
			const minPriceNum = parseFloat(minPrice);
			if (!isNaN(minPriceNum)) {
				conditions.push(gte(listings.price, minPriceNum.toString()));
			}
		}
		if (maxPrice) {
			const maxPriceNum = parseFloat(maxPrice);
			if (!isNaN(maxPriceNum)) {
				conditions.push(lte(listings.price, maxPriceNum.toString()));
			}
		}

		// Location filter
		if (location) {
			conditions.push(like(listings.locationCity, `%${location}%`));
		}

		// Radius/Proximity filter (if user has coordinates and radius is specified)
		if (userLat && userLon && radius && radius !== 'any') {
			const radiusKm = parseFloat(radius);
			if (!isNaN(radiusKm) && radiusKm > 0) {
				// Use Haversine formula to calculate distance
				// Distance in kilometers = 6371 * acos(cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) + sin(radians(lat1)) * sin(radians(lat2)))
				// We'll filter listings within the radius
				const latRad = userLat * Math.PI / 180;
				const lonRad = userLon * Math.PI / 180;
				
				// Add condition to filter by distance
				// Only apply if listing has coordinates
				conditions.push(
					and(
						sql`${listings.locationLatitude} IS NOT NULL`,
						sql`${listings.locationLongitude} IS NOT NULL`,
						sql`(
							6371 * acos(
								cos(radians(${userLat})) * 
								cos(radians(${listings.locationLatitude}::numeric)) * 
								cos(radians(${listings.locationLongitude}::numeric) - radians(${userLon})) + 
								sin(radians(${userLat})) * 
								sin(radians(${listings.locationLatitude}::numeric))
							)
						) <= ${radiusKm}`
					)
				);
			}
		}

		// Condition filter (only for products)
		if (condition) {
			conditions.push(eq(listings.condition, condition));
		}

		// Build order by
		let orderBy;
		switch (sortBy) {
			case 'price-low':
				orderBy = asc(listings.price);
				break;
			case 'price-high':
				orderBy = desc(listings.price);
				break;
			case 'distance':
				// Sort by distance if radius filtering is active
				if (userLat && userLon && radius && radius !== 'any') {
					orderBy = sql`(
						6371 * acos(
							cos(radians(${userLat})) * 
							cos(radians(${listings.locationLatitude}::numeric)) * 
							cos(radians(${listings.locationLongitude}::numeric) - radians(${userLon})) + 
							sin(radians(${userLat})) * 
							sin(radians(${listings.locationLatitude}::numeric))
						)
					) ASC`;
				} else {
					orderBy = desc(listings.createdAt);
				}
				break;
			case 'oldest':
				orderBy = asc(listings.createdAt);
				break;
			case 'newest':
			default:
				orderBy = desc(listings.createdAt);
				break;
		}

		// Build select fields
		const selectFields = {
			id: listings.id,
			title: listings.title,
			description: listings.description,
			price: listings.price,
			type: listings.type,
			locationCity: listings.locationCity,
			locationPostcode: listings.locationPostcode,
			locationLatitude: listings.locationLatitude,
			locationLongitude: listings.locationLongitude,
			categoryId: listings.categoryId,
			userId: listings.userId,
			featured: listings.featured,
			urgent: listings.urgent,
			viewCount: listings.viewCount,
			createdAt: listings.createdAt
		};

		// Add distance calculation if radius filtering is active
		if (userLat && userLon && radius && radius !== 'any') {
			const radiusKm = parseFloat(radius);
			if (!isNaN(radiusKm) && radiusKm > 0) {
				selectFields.distance = sql`(
					6371 * acos(
						cos(radians(${userLat})) * 
						cos(radians(${listings.locationLatitude}::numeric)) * 
						cos(radians(${listings.locationLongitude}::numeric) - radians(${userLon})) + 
						sin(radians(${userLat})) * 
						sin(radians(${listings.locationLatitude}::numeric))
					)
				)`.as('distance');
			}
		}

		// Optimized: Use JOINs to fetch listings with categories and images in a single query
		// This eliminates N+1 query problem (was making 1 + 20*2 = 41 queries, now makes 2 queries)
		
		// First, get listings with categories using LEFT JOIN
		const listingsWithCategoriesData = await db
			.select({
				...selectFields,
				category: categories
			})
			.from(listings)
			.leftJoin(categories, eq(listings.categoryId, categories.id))
			.where(and(...conditions))
			.orderBy(orderBy)
			.limit(limit)
			.offset(offset);

		// Get listing IDs for batch image fetching
		const listingIds = listingsWithCategoriesData.map(l => l.id);
		
		// Batch fetch first image for each listing using a single query
		// This gets the first image (by displayOrder) for each listing in one query
		let imagesMap = new Map();
		if (listingIds.length > 0) {
			const imagesData = await db
				.select({
					listingId: listingImages.listingId,
					imageUrl: listingImages.imageUrl,
					displayOrder: listingImages.displayOrder
				})
				.from(listingImages)
				.where(inArray(listingImages.listingId, listingIds))
				.orderBy(listingImages.displayOrder);
			
			// Group by listingId and take first image for each
			for (const img of imagesData) {
				if (!imagesMap.has(img.listingId)) {
					imagesMap.set(img.listingId, img);
				}
			}
		}

		// Combine listings with categories and images
		const listingsWithCategories = listingsWithCategoriesData.map((listing) => {
			// Get image for this listing
			const firstImage = imagesMap.get(listing.id);
			
			// Convert image URL to full R2 URL if it's just a key
			let imageUrl = null;
			if (firstImage) {
				imageUrl = firstImage.imageUrl;
				if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
					imageUrl = getR2PublicUrl(imageUrl, false, platform);
				}
			}

			return {
				...listing,
				category: listing.category || null,
				imageUrl: imageUrl || null
			};
		});

		// Get total count
		const [countResult] = await db
			.select({ count: sql`count(*)::int` })
			.from(listings)
			.where(and(...conditions));

		const totalCount = Number(countResult?.count) || 0;

		// Fetch all active categories for filters
		const allCategories = await db
			.select()
			.from(categories)
			.where(eq(categories.isActive, true))
			.orderBy(categories.displayOrder, categories.name);

		return {
			listings: listingsWithCategories,
			categories: allCategories,
			totalCount,
			currentPage: page,
			totalPages: Math.ceil(totalCount / limit),
			marketplaceUser,
			filters: {
				searchQuery,
				categorySlug,
				location,
				radius,
				sortBy,
				type,
				minPrice,
				maxPrice,
				condition
			}
		};
	} catch (error) {
		console.error('Error loading marketplace data:', error);
		return {
			listings: [],
			categories: [],
			totalCount: 0,
			currentPage: 1,
			totalPages: 0,
			marketplaceUser,
			filters: {
				searchQuery: '',
				categorySlug: '',
				location: '',
				radius: '',
				sortBy: 'newest',
				type: '',
				minPrice: '',
				maxPrice: '',
				condition: ''
			}
		};
	}
}
