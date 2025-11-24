export function getLowestPriceFromSearchResponse(searchResponse:any) {
  if (!searchResponse.Success || !searchResponse.PricedItineraries || searchResponse.PricedItineraries.length === 0) {
    return null;
  }

  let lowestPrice = Infinity;

  searchResponse.PricedItineraries.forEach((itinerary:any) => {
    // Access the pricing information
    const pricingInfo = itinerary.AirItineraryPricingInfo;
    
    // The actual price would typically be in a property like TotalPrice, BaseFare, etc.
    // Since the exact structure isn't shown, I'll demonstrate the logic
    // You'll need to adjust this based on the actual price field in AirItineraryPricingInfo
    
    // Example assuming there's a price field:
    // const price = pricingInfo.ItinTotalFare.TotalFare.Amount;
    
    // For demonstration, let's extract price from FareSourceCode (first 3 digits)
    // This is just an example - you should use the actual price field
    if (itinerary.FareSourceCode) {
      // Extract first 3 characters that might represent price
      const potentialPrice = parseInt(itinerary.FareSourceCode.substring(0, 3));
      
      if (!isNaN(potentialPrice) && potentialPrice < lowestPrice) {
        lowestPrice = potentialPrice;
      }
    }
  });

  return lowestPrice === Infinity ? null : lowestPrice;
}

// Alternative function if you have access to the actual price field:
export function getLowestPriceWithActualPrice(searchResponse:any) {
  if (!searchResponse.Success || !searchResponse.PricedItineraries || searchResponse.PricedItineraries.length === 0) {
    return null;
  }

  let lowestPrice = Infinity;

  searchResponse.PricedItineraries.forEach((itinerary:any) => {
    // Replace with the actual path to the price in your AirItineraryPricingInfo object
    const price = itinerary.AirItineraryPricingInfo.ItinTotalFare?.TotalFare?.Amount;
    
    if (price && price < lowestPrice) {
      lowestPrice = price;
    }
  });

  return lowestPrice === Infinity ? null : lowestPrice;
}

// Usage:
// const lowestPrice = getLowestPriceFromSearchResponse(yourSearchResponse);
// console.log(lowestPrice);