export function calculateEMA(prices: number[], period: number): number[] {
	const ema: number[] = [];
	const multiplier = 2 / (period + 1);

	prices.forEach((price, index) => {
		if (index === 0) {
			ema.push(price); // First EMA value is the first price
		} else {
			ema.push((price - ema[index - 1]) * multiplier + ema[index - 1]);
		}
	});

	return ema;
}

/**
 * Calculates the MACD (Moving Average Convergence Divergence) indicator.
 * @param prices Array of closing prices.
 * @param shortPeriod Short EMA period.
 * @param longPeriod Long EMA period.
 * @param signalPeriod Signal line EMA period.
 * @returns Object containing MACD line, signal line, and histogram.
 */
export function calculateMACD(
	prices: number[],
	shortPeriod: number,
	longPeriod: number,
	signalPeriod: number
): { macdLine: number[]; signalLine: number[]; histogram: number[] } {
	const shortEMA = calculateEMA(prices, shortPeriod);
	const longEMA = calculateEMA(prices, longPeriod);
	const macdLine = shortEMA.map((value, index) => value - longEMA[index]);
	const signalLine = calculateEMA(macdLine, signalPeriod);
	const histogram = macdLine.map((value, index) => value - signalLine[index]);

	return { macdLine, signalLine, histogram };
}

/**
 * Calculates the RSI (Relative Strength Index) indicator.
 * @param prices Array of closing prices.
 * @param period RSI period.
 * @returns Array of RSI values.
 */
export function calculateRSI(prices: number[], period: number): number[] {
	const rsi: number[] = [];
	const gains: number[] = [];
	const losses: number[] = [];

	for (let i = 1; i < prices.length; i++) {
		const change = prices[i] - prices[i - 1];
		gains.push(Math.max(change, 0));
		losses.push(Math.abs(Math.min(change, 0)));
	}

	for (let i = period; i < prices.length; i++) {
		const avgGain =
			gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
		const avgLoss =
			losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;

		const rs = avgGain / avgLoss;
		rsi.push(100 - 100 / (1 + rs));
	}

	return rsi;
}

/**
 * Calculates the Bollinger Bands indicator.
 * @param prices Array of closing prices.
 * @param period Bollinger Bands period.
 * @param stdDevMultiplier Standard deviation multiplier.
 * @returns Object containing upper band, lower band, and middle band (SMA).
 */
export function calculateBollingerBands(
	prices: number[],
	period: number,
	stdDevMultiplier: number
): {
	upperBand: number[];
	lowerBand: number[];
	middleBand: number[];
} {
	const middleBand = calculateEMA(prices, period);
	const upperBand: number[] = [];
	const lowerBand: number[] = [];

	for (let i = period - 1; i < prices.length; i++) {
		const slice = prices.slice(i - period + 1, i + 1);
		const mean = slice.reduce((a, b) => a + b, 0) / period;
		const stdDev =
			Math.sqrt(slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period) *
			stdDevMultiplier;

		upperBand.push(mean + stdDev);
		lowerBand.push(mean - stdDev);
	}

	return { upperBand, lowerBand, middleBand };
}

/**
 * Calculates the ATR (Average True Range) indicator.
 * @param prices Array of closing prices.
 * @param period ATR period.
 * @returns Array of ATR values.
 */
export function calculateATR(prices: number[], period: number): number[] {
	const atr: number[] = [];
	const trueRanges: number[] = [];

	for (let i = 1; i < prices.length; i++) {
		const highLow = prices[i] - prices[i - 1];
		const highClose = Math.abs(prices[i] - prices[i - 1]);
		const lowClose = Math.abs(prices[i] - prices[i - 1]);
		trueRanges.push(Math.max(highLow, highClose, lowClose));
	}

	for (let i = period; i < trueRanges.length; i++) {
		const avgTrueRange =
			trueRanges.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
		atr.push(avgTrueRange);
	}

	return atr;
}
