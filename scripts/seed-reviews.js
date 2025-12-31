import { createDb } from '../src/lib/server/db.js';
import { reviews, trades, users } from '../src/lib/server/schema.js';
import { eq, and } from 'drizzle-orm';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/marketplace_db';

// Sample review titles and comments
const reviewTitles = [
	'Great transaction!',
	'Excellent seller',
	'Fast and reliable',
	'Item as described',
	'Very satisfied',
	'Good communication',
	'Would trade again',
	'Honest seller',
	'Quick response',
	'Perfect condition',
	'Highly recommend',
	'Professional service',
	'Item exactly as shown',
	'Trustworthy buyer',
	'Smooth transaction',
	'Pleasure to deal with',
	'Fair price',
	'On time delivery',
	'Great packaging',
	'Responsive and helpful',
	'Good experience',
	'As advertised',
	'No issues',
	'Reliable trader',
	'Positive experience',
	'Could be better',
	'Minor issues',
	'Slow response',
	'Item had some wear',
	'Communication could improve'
];

const positiveComments = [
	'Great experience trading with this user. Item was exactly as described and communication was excellent throughout.',
	'Very smooth transaction. The seller was responsive and the item arrived in perfect condition. Highly recommend!',
	'Excellent seller! Fast shipping and item was exactly as shown in the photos. Would definitely trade again.',
	'Professional and trustworthy. The item was well-packaged and arrived quickly. Great communication throughout.',
	'Pleasure to deal with. Item was in great condition and the seller was very helpful. Highly recommended!',
	'Quick response and fast delivery. Item was exactly as described. Very satisfied with the transaction.',
	'Great buyer! Payment was prompt and communication was clear. Would trade with again anytime.',
	'Reliable trader. The item matched the description perfectly and shipping was fast. No complaints!',
	'Excellent experience. The seller was professional and the item was in perfect condition. Thank you!',
	'Very satisfied with this trade. Item was as described and the seller was responsive to all questions.',
	'Honest seller with great communication. Item arrived quickly and in excellent condition. Highly recommend!',
	'Smooth transaction from start to finish. Item was exactly as shown and seller was very professional.',
	'Great packaging and fast shipping. Item was in perfect condition. Would definitely trade again!',
	'Trustworthy buyer. Payment was quick and communication was clear. Great experience overall.',
	'Item was exactly as described. Seller was responsive and helpful. Very satisfied with the purchase.',
	'Professional service and great communication. Item arrived on time and in perfect condition.',
	'Excellent trader! Fast response and the item was in great condition. Would trade again.',
	'Very reliable seller. Item was well-packaged and arrived quickly. Highly recommended!',
	'Great experience overall. Item was as described and seller was very helpful. Thank you!',
	'Quick and easy transaction. Item was in perfect condition and seller was very professional.'
];

const neutralComments = [
	'Item was mostly as described, though there were some minor differences. Overall okay experience.',
	'Transaction went smoothly. Item had some wear but was generally as expected. Communication was decent.',
	'Decent experience. Item arrived on time but had some minor issues. Seller was responsive to concerns.',
	'Okay transaction. Item was functional but showed more wear than expected. Still usable though.',
	'Average experience. Item was as described but communication could have been better. No major issues.',
	'Transaction completed successfully. Item had some minor wear but was still in good condition.',
	'Decent seller. Item arrived but took longer than expected. Overall okay experience.',
	'Item was functional but had some wear. Seller was responsive when contacted. Acceptable trade.',
	'Okay experience. Item was mostly as described but communication was a bit slow at times.',
	'Transaction completed. Item had minor issues but seller was willing to work things out.'
];

const negativeComments = [
	'Item was not as described. Had more wear than shown in photos. Communication was also slow.',
	'Disappointed with the condition of the item. It had more damage than expected. Seller was not very responsive.',
	'Item arrived damaged. Seller was slow to respond to messages. Not a great experience overall.',
	'Transaction had issues. Item was different from description and seller was not helpful.',
	'Poor communication throughout. Item was not in the condition described. Would not recommend.',
	'Item had significant wear not mentioned in listing. Seller was unresponsive to concerns.',
	'Not satisfied with this trade. Item was damaged and seller was not cooperative.',
	'Disappointing experience. Item was not as described and communication was poor.',
	'Item arrived late and in worse condition than expected. Seller was not helpful.',
	'Poor experience overall. Item was damaged and seller was unresponsive to messages.'
];

// Generate a random review based on rating
function generateReview(rating) {
	let title, comment;
	
	if (rating >= 4) {
		// Positive reviews
		title = reviewTitles[Math.floor(Math.random() * 25)]; // First 25 are positive
		comment = positiveComments[Math.floor(Math.random() * positiveComments.length)];
	} else if (rating === 3) {
		// Neutral reviews
		title = reviewTitles[Math.floor(Math.random() * 5) + 25]; // Middle ones
		comment = neutralComments[Math.floor(Math.random() * neutralComments.length)];
	} else {
		// Negative reviews
		title = reviewTitles[Math.floor(Math.random() * 5) + 25]; // Last ones
		comment = negativeComments[Math.floor(Math.random() * negativeComments.length)];
	}
	
	return { title, comment };
}

// Generate rating distribution (mostly positive, some neutral, few negative)
function generateRating() {
	const rand = Math.random();
	if (rand < 0.65) return 5; // 65% five stars
	if (rand < 0.85) return 4; // 20% four stars
	if (rand < 0.95) return 3; // 10% three stars
	if (rand < 0.98) return 2; // 3% two stars
	return 1; // 2% one star
}

async function seedReviews() {
	const db = createDb(databaseUrl);

	try {
		console.log('🌱 Seeding reviews...\n');

		// Get all completed trades
		const completedTrades = await db
			.select()
			.from(trades)
			.where(eq(trades.status, 'completed'));

		console.log(`Found ${completedTrades.length} completed trades\n`);

		if (completedTrades.length === 0) {
			console.log('⚠️  No completed trades found. Please complete some trades first or seed trades.');
			process.exit(0);
		}

		// Get all existing reviews to avoid duplicates
		const existingReviews = await db.select().from(reviews);
		const existingTradeIds = new Set(existingReviews.map(r => r.tradeId));
		
		let created = 0;
		let skipped = 0;

		for (const trade of completedTrades) {
			// Skip if reviews already exist for this trade
			if (existingTradeIds.has(trade.id)) {
				skipped++;
				continue;
			}

			// Verify buyer and seller exist
			const [buyer] = await db
				.select()
				.from(users)
				.where(eq(users.id, trade.buyerId))
				.limit(1);

			const [seller] = await db
				.select()
				.from(users)
				.where(eq(users.id, trade.sellerId))
				.limit(1);

			if (!buyer || !seller) {
				console.log(`⚠️  Skipping trade ${trade.id}: buyer or seller not found`);
				skipped++;
				continue;
			}

			// Generate reviews from both parties
			// Buyer reviews seller
			const buyerRating = generateRating();
			const buyerReview = generateReview(buyerRating);
			
			await db.insert(reviews).values({
				tradeId: trade.id,
				reviewerId: trade.buyerId,
				revieweeId: trade.sellerId,
				rating: buyerRating,
				title: buyerReview.title,
				comment: buyerReview.comment,
				isPublic: true,
			});

			// Seller reviews buyer
			const sellerRating = generateRating();
			const sellerReview = generateReview(sellerRating);
			
			await db.insert(reviews).values({
				tradeId: trade.id,
				reviewerId: trade.sellerId,
				revieweeId: trade.buyerId,
				rating: sellerRating,
				title: sellerReview.title,
				comment: sellerReview.comment,
				isPublic: true,
			});

			created += 2;
			console.log(`✓ Created reviews for trade ${trade.tradeNumber} (${buyerRating}⭐ from buyer, ${sellerRating}⭐ from seller)`);
		}

		console.log(`\n✨ Successfully created ${created} reviews!`);
		if (skipped > 0) {
			console.log(`⚠️  Skipped ${skipped} trades (reviews already exist or missing users)`);
		}
		process.exit(0);
	} catch (error) {
		console.error('❌ Error seeding reviews:', error);
		process.exit(1);
	}
}

seedReviews();

