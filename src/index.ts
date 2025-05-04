import logger from "./utils/logger";
import { prefillPriceBuffer, streamPrices } from "./data/fetchPrices";
import { forecastPriceWithAR4 } from "./model/arimaForecast";
import { handlePriceUpdate } from "./trade/tradeManager";
import exchangeConfig from "./config/exchange.config";

const priceBuffer: number[] = []; // Buffer to store recent prices
const coefficients = [0.25, 0.25, 0.25, 0.25]; // AR(4) coefficients

(async () => {
	logger.info("Starting the trading bot...");

	// Prefill the price buffer with the last 5 closed candles
	await prefillPriceBuffer(priceBuffer, exchangeConfig);
	logger.info(`Price Buffer After Pre-Fill: ${priceBuffer}`);

	// Start WebSocket price streaming
	streamPrices(priceBuffer, exchangeConfig, (currentPrice, isCandleClosed) => {
		// Calculate forecasted price
		const forecastedPrice = forecastPriceWithAR4(priceBuffer, coefficients);

		// Handle price updates for entry/exit conditions
		handlePriceUpdate(currentPrice, isCandleClosed, forecastedPrice);
	});
})();
