/**
 * Calculates open-to-close returns for a series of prices.
 * @param prices Array of closing prices.
 * @returns Array of open-to-close returns.
 */
export function calculateReturns(prices: number[]): number[] {
	const returns: number[] = [];
	for (let i = 1; i < prices.length; i++) {
		const returnVal = (prices[i] - prices[i - 1]) / prices[i - 1];
		returns.push(returnVal);
	}
	return returns;
}
