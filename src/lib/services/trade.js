/**
 * Fetches a trade by listing ID.
 * @param {string} listingId - The ID of the listing.
 * @param {string} buyerId - The ID of the buyer.
 * @param {string} sellerId - The ID of the seller.
 * @returns {Promise<Object>} - The trade object.
 */
export async function fetchTrade(listingId, buyerId, sellerId) {
  try {
    const response = await fetch(
      `/api/trades?listingId=${listingId}&buyerId=${buyerId}&sellerId=${sellerId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch trades");
    }

    const data = await response.json();

    const { trade } = data;
    if (trade && trade.length > 0) {
      console.log("Trade found:", trade[0]);
      return trade[0];
    } else {
      console.log("No trade found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching trade:", error);
    throw error;
  }
}

/**
 * Creates a new trade.
 * @param {Object} trade - The trade object.
 * @returns {Promise<Object>} - The created trade object.
 */
export async function createTrade(trade) {
  try {
    const response = await fetch("/api/trades", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trade),
    });

    if (!response.ok) {
      throw new Error("Failed to create trade");
    }

    const data = await response.json();
    return data.trade;
  } catch (error) {
    console.error("Error creating trade:", error);
    throw error;
  }
}
