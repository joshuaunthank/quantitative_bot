import { calculateReturns } from "../data/calculateReturns";
import logger from "../utils/logger";
import strategyConfig from "../config/strategy.config";

/**
 * Applies an AR(4) model to forecast the next return.
 * @param returns Array of past returns.
 * @returns Forecasted return.
 */
function ar4Forecast(returns: number[]): number {
	const coefficients = Array(strategyConfig.indicators.lags.period).fill(0.25); // Example: Equal weights
	if (returns.length < coefficients.length) {
		throw new Error("Not enough data to apply AR(4) model.");
	}

	let forecast = 0;
	for (let i = 0; i < coefficients.length; i++) {
		forecast += coefficients[i] * returns[returns.length - 1 - i];
	}

	logger.debug(`AR(4) Inputs: ${returns.slice(-coefficients.length)}`);
	logger.debug(`AR(4) Forecast: ${forecast.toFixed(8)}`);
	return forecast;
}

/**
 * Forecasts the next price using AR(4) model.
 * @param prices Array of closing prices (only closed candles).
 * @returns Forecasted price.
 */
export function forecastPriceWithAR4(
	prices: number[],
	coefficients: number[]
): number {
	logger.debug(`Prices for Forecast: ${prices}`);
	logger.debug(`Prices Length: ${prices.length}`);

	if (prices.length < strategyConfig.indicators.lags.period + 1) {
		throw new Error("Not enough data to calculate AR(4) forecast.");
	}

	// Calculate returns from the last 5 prices
	const returns = calculateReturns(
		prices.slice(-strategyConfig.indicators.lags.period - 1)
	);
	logger.debug(`Returns for Forecast: ${returns}`);

	// Apply AR(4) model to calculate the forecasted return
	const forecastedReturn = ar4Forecast(returns);

	// Forecasted price = last closing price * (1 + forecasted return)
	const forecastedPrice = prices[prices.length - 1] * (1 + forecastedReturn);

	logger.info(`Forecasted Price: ${forecastedPrice.toFixed(2)}`);
	return forecastedPrice;
}
