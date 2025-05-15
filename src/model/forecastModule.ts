export type ForecastInput = {
	open: number[];
	close: number[];
	ema5: number[];
	ema10: number[];
	ema30: number[];
	macdHist: number[];
	prevError: number[]; // Previous errors (e.g., actual_error.shift(1))
};

export type Coefficients = {
	ar: number[]; // AR(4) coefficients
	macdS: { const: number; ema5: number; ema10: number; ema30: number };
	error: {
		const: number;
		lag1: number;
		lag4: number;
		macdDelta: number;
		macdHist: number;
	};
};

/**
 * Runs the ARIMA-based forecast with error correction.
 * @param data - Input data for the forecast.
 * @param coeffs - Coefficients for AR(4), MACD_S, and error correction.
 * @returns Array of forecasted prices.
 */
export function runForecast(
	data: ForecastInput,
	coeffs: Coefficients
): number[] {
	const n = data.close.length;
	const forecastedPrices: number[] = [];

	for (let i = 4; i < n; i++) {
		// Calculate open-to-close returns for the last 4 candles
		const openToCloseReturns = [
			(data.close[i - 1] - data.open[i - 1]) / data.open[i - 1],
			(data.close[i - 2] - data.open[i - 2]) / data.open[i - 2],
			(data.close[i - 3] - data.open[i - 3]) / data.open[i - 3],
			(data.close[i - 4] - data.open[i - 4]) / data.open[i - 4],
		];

		// ARIMA Forecast
		const arForecastReturn = coeffs.ar.reduce(
			(sum, c, idx) => sum + c * openToCloseReturns[idx],
			0
		);
		const arimaForecast = data.close[i - 1] * (1 + arForecastReturn);

		// MACD_S Forecast and Delta
		const macdS =
			coeffs.macdS.const +
			coeffs.macdS.ema5 * data.ema5[i] +
			coeffs.macdS.ema10 * data.ema10[i] +
			coeffs.macdS.ema30 * data.ema30[i];

		const macdSPrev =
			coeffs.macdS.const +
			coeffs.macdS.ema5 * data.ema5[i - 1] +
			coeffs.macdS.ema10 * data.ema10[i - 1] +
			coeffs.macdS.ema30 * data.ema30[i - 1];

		const macdSDelta = macdS - macdSPrev;

		// Error Forecast
		const lag1 = (data.close[i - 1] - data.close[i - 2]) / data.close[i - 2];
		const lag4 = (data.close[i - 1] - data.close[i - 5]) / data.close[i - 5];

		const errorForecast =
			coeffs.error.const +
			coeffs.error.lag1 * lag1 +
			coeffs.error.lag4 * lag4 +
			coeffs.error.macdDelta * macdSDelta +
			coeffs.error.macdHist * data.macdHist[i] +
			data.prevError[i - 1];

		// Corrected Forecast
		const correctedForecast = arimaForecast + errorForecast;

		forecastedPrices.push(correctedForecast);
	}

	return forecastedPrices;
}
