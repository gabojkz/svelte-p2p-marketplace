import { redirect } from '@sveltejs/kit';
import { favorites, listings, users, categories } from '$lib/server/schema';
import { eq, and, or, like, desc, asc } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, url }) {
	if (!locals.session || !locals.user) {
		throw redirect(302, '/login');
	}

	const db = locals.db;
	if (!db) {
		throw new Error('Database connection not found');
	}

	// Get marketplace user
	const [marketplaceUser] = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, locals.user.id))
		.limit(1);

	if (!marketplaceUser) {
		throw redirect(302, '/login');
	}

	// Get query parameters
	const searchQuery = url.searchParams.get('search') || '';
	const sortBy = url.searchParams.get('sort') || 'newest';
	const sortOrder = url.searchParams.get('order') || 'desc';

	// Build where conditions
	const conditions = [eq(favorites.userId, marketplaceUser.id)];

	// Get all favorites with listing details
	let favoritesQuery = db
		.select({
			id: favorites.id,
			listingId: favorites.listingId,
			createdAt: favorites.createdAt,
			listing: listings,
			category: categories
		})
		.from(favorites)
		.innerJoin(listings, eq(favorites.listingId, listings.id))
		.leftJoin(categories, eq(listings.categoryId, categories.id))
		.where(and(...conditions));

	// Apply search filter if provided
	let allFavorites = await favoritesQuery;

	if (searchQuery.trim()) {
		const query = searchQuery.toLowerCase();
		allFavorites = allFavorites.filter(fav =>
			fav.listing.title.toLowerCase().includes(query) ||
			fav.listing.description?.toLowerCase().includes(query) ||
			fav.category?.name.toLowerCase().includes(query) ||
			fav.listing.locationCity?.toLowerCase().includes(query)
		);
	}

	// Apply sorting
	allFavorites.sort((a, b) => {
		let aVal, bVal;

		switch (sortBy) {
			case 'title':
				aVal = a.listing.title.toLowerCase();
				bVal = b.listing.title.toLowerCase();
				break;
			case 'price':
				aVal = parseFloat(a.listing.price || '0');
				bVal = parseFloat(b.listing.price || '0');
				break;
			case 'category':
				aVal = a.category?.name || '';
				bVal = b.category?.name || '';
				break;
			case 'location':
				aVal = a.listing.locationCity || '';
				bVal = b.listing.locationCity || '';
				break;
			case 'newest':
			default:
				aVal = new Date(a.createdAt).getTime();
				bVal = new Date(b.createdAt).getTime();
				break;
		}

		if (sortOrder === 'asc') {
			return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
		} else {
			return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
		}
	});

	// Format favorites data
	const favoritesData = allFavorites.map(fav => ({
		id: fav.id,
		listingId: fav.listingId,
		createdAt: fav.createdAt,
		listing: {
			...fav.listing,
			category: fav.category
		}
	}));

	return {
		favorites: favoritesData,
		marketplaceUser,
		filters: {
			searchQuery,
			sortBy,
			sortOrder
		}
	};
}

