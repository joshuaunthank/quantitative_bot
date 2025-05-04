import strategy from "../config/strategy.config";

type Signal = "BUY" | "SELL" | "HOLD";

/**
 * Generates a trade signal based on forecasted and current prices.
 */
export function generateSignal(forecast: number, current: number): Signal {
	const diff = forecast - current;

	if (diff > strategy.threshold) return "BUY";
	if (diff < -strategy.threshold) return "SELL";
	return "HOLD";
}
