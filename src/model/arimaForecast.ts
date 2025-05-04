import { calculateReturns } from "../data/calculateReturns";
import logger from "../utils/logger";

/**
 * Applies an AR(4) model to forecast the next return.
 * @param returns Array of past returns.
 * @param coefficients AR(4) coefficients.
 * @returns Forecasted return.
 */
function ar4Forecast(returns: number[], coefficients: number[]): number {
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
 * @param coefficients AR(4) coefficients.
 * @returns Forecasted price.
 */
export function forecastPriceWithAR4(
	prices: number[],
	coefficients: number[]
): number {
	logger.debug(`Prices for Forecast: ${prices}`);
	logger.debug(`Prices Length: ${prices.length}`);
	logger.debug(`Coefficients: ${coefficients}`);

	if (prices.length < coefficients.length + 1) {
		throw new Error("Not enough data to calculate AR(4) forecast.");
	}

	// Calculate returns from the last 5 prices
	const returns = calculateReturns(prices.slice(-coefficients.length - 1));
	logger.debug(`Returns for Forecast: ${returns}`);

	// Apply AR(4) model to calculate the forecasted return
	const forecastedReturn = ar4Forecast(returns, coefficients);
	logger.debug(`Forecasted Return: ${forecastedReturn}`);

	// Calculate the forecasted price
	const lastPrice = prices[prices.length - 1];
	const forecastedPrice = lastPrice * (1 + forecastedReturn);
	logger.debug(`Last Price: ${lastPrice}`);
	logger.debug(`Forecasted Price: ${forecastedPrice}`);

	logger.info(
		`AR(4) Forecast: Last Price: ${lastPrice.toFixed(
			2
		)}, Forecasted Return: ${forecastedReturn.toFixed(
			8
		)}, Forecasted Price: ${forecastedPrice.toFixed(2)}`
	);

	return forecastedPrice;
}
