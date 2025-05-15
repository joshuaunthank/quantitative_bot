import { forecastPriceWithAR4 } from "../model/arimaForecast";
import logger from "../utils/logger";
import strategyConfig from "../config/strategy.config";

export function handlePriceUpdate(
	currentPrice: number,
	isCandleClosed: boolean,
	openPrice: number,
	priceBuffer: number[]
) {
	if (isCandleClosed) {
		// Update price buffer
		priceBuffer.push(currentPrice);

		// Ensure the buffer doesn't exceed the required size
		if (priceBuffer.length > 100) priceBuffer.shift();

		// Calculate AR(4) forecast
		try {
			const coefficients = strategyConfig.indicators.coefficients;
			const forecastedPrice = forecastPriceWithAR4(priceBuffer, coefficients);

			logger.info(`Forecasted Price: ${forecastedPrice.toFixed(2)}`);
			logger.info(`Current Price: ${currentPrice.toFixed(2)}`);

			// Trading logic based on forecast
			const threshold = strategyConfig.threshold;
			if (forecastedPrice > currentPrice + threshold) {
				logger.info("Signal: BUY");
				// Place buy order logic here
			} else if (forecastedPrice < currentPrice - threshold) {
				logger.info("Signal: SELL");
				// Place sell order logic here
			} else {
				logger.info("Signal: HOLD");
			}
		} catch (error) {
			logger.error(`Error in AR(4) forecast: ${error.message}`);
		}
	}
}
