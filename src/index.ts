import logger from "./utils/logger";
import { prefillPriceBuffer, streamPrices } from "./data/fetchPrices";
import { forecastPriceWithAR4 } from "./model/arimaForecast";
import { handlePriceUpdate } from "./trade/tradeManager";
import exchangeConfig from "./config/exchange.config";
import strategyConfig from "./config/strategy.config";

const priceBuffer: number[] = []; // Buffer to store recent prices

(async () => {
	logger.info("Starting the trading bot...");

	// Prefill the price buffer with the last 5 closed candles
	await prefillPriceBuffer(priceBuffer, exchangeConfig);
	logger.info(`Price Buffer After Pre-Fill: ${priceBuffer}`);

	// Start WebSocket price streaming
	streamPrices(priceBuffer, exchangeConfig, (currentPrice, isCandleClosed) => {
		// Calculate forecasted price
		const forecastedPrice = forecastPriceWithAR4(
			priceBuffer,
			strategyConfig.indicators.coefficients
		);

		// Handle price updates for entry/exit conditions
		handlePriceUpdate(
			currentPrice,
			isCandleClosed,
			forecastedPrice,
			priceBuffer
		);
	});
})();
