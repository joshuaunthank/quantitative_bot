export interface ExitConditions {
	stopLoss: number;
	trailingExitActivation: number;
	trailingExit?: number;
}

/**
 * Calculates exit conditions (stop-loss and trailing exit activation).
 * @param entryPrice The price at which the trade was entered.
 * @param action The trade action ("long" or "short").
 * @param forecastedPrice The forecasted price.
 * @returns Exit conditions object.
 */
export function calculateExitConditions(
	entryPrice: number,
	action: "long" | "short",
	forecastedPrice: number
): ExitConditions {
	if (action === "long") {
		return {
			stopLoss: entryPrice * 0.99, // 1% below entry price
			trailingExitActivation: (forecastedPrice + entryPrice) / 2,
		};
	} else if (action === "short") {
		return {
			stopLoss: entryPrice * 1.01, // 1% above entry price
			trailingExitActivation: (forecastedPrice + entryPrice) / 2,
		};
	}

	throw new Error("Invalid action for exit conditions");
}

/**
 * Updates trailing exit based on the highest price reached after activation.
 * @param highestPrice The highest price reached after activation.
 * @param trailingExitActivation The price at which trailing exit is activated.
 * @returns Updated trailing exit price.
 */
export function updateTrailingExit(
	highestPrice: number,
	trailingExitActivation: number
): number | null {
	if (highestPrice >= trailingExitActivation) {
		// Trailing exit is 0.1% below the highest price
		return highestPrice * 0.999;
	}
	return null; // Trailing exit not activated yet
}
