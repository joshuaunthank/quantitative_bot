export interface EntryDecision {
	action: "long" | "short" | "wait";
	entryPrice?: number;
}

/**
 * Evaluates entry conditions based on forecasted price and current price.
 * @param forecastedPrice The forecasted price.
 * @param currentPrice The current price at the time of return calculation.
 * @returns Entry decision object.
 */
export function evaluateEntryConditions(
	forecastedPrice: number,
	currentPrice: number
): EntryDecision {
	const returnPercentage =
		((forecastedPrice - currentPrice) / currentPrice) * 100;

	if (returnPercentage > 0.2) {
		// Long position
		return { action: "long", entryPrice: currentPrice };
	} else if (returnPercentage < -0.2) {
		// Short position
		return { action: "short", entryPrice: currentPrice };
	}

	// Wait if conditions are not met
	return { action: "wait" };
}
