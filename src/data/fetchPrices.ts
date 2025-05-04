const ccxt = require("ccxt"); // Use require for CommonJS modules
console.log(ccxt.pro);

import WebSocket from "ws";
import logger from "../utils/logger";

let forecastedReturn: number | null = null; // Store the forecasted return for the current candle

export async function streamPrices(
	priceBuffer: number[],
	exchangeConfig: any,
	onPriceUpdate: (currentPrice: number, isCandleClosed: boolean) => void
) {
	const symbol = exchangeConfig.symbols[0].replace("/", "").toLowerCase(); // e.g., BTC/USDT -> btcusdt
	const wsUrl = `wss://stream.binance.com:9443/ws/${symbol}@kline_${exchangeConfig.timeframes[0]}`; // WebSocket URL
	const ws = new WebSocket(wsUrl);

	ws.on("open", () => {
		logger.info(`[WebSocket] Connected to ${wsUrl}`);
	});

	ws.on("message", (data: { toString: () => string }) => {
		try {
			const message = JSON.parse(data.toString());
			const kline = message.k; // Kline data
			const currentPrice = parseFloat(kline.c); // Extract the current price
			const isCandleClosed = kline.x; // Check if the candle is closed

			logger.info(`[WebSocket] Current Price: ${currentPrice.toFixed(2)}`);
			onPriceUpdate(currentPrice, isCandleClosed); // Trigger callback
		} catch (err) {
			logger.error(`[WebSocket Error] Failed to parse message: ${err.message}`);
		}
	});

	ws.on("error", (err: { message: any }) => {
		logger.error(`[WebSocket Error] ${err.message}`);
	});

	ws.on("close", () => {
		logger.warn("[WebSocket] Connection closed. Reconnecting...");
		setTimeout(
			() => streamPrices(priceBuffer, exchangeConfig, onPriceUpdate),
			3000
		); // Reconnect after 3 seconds
	});
}

export async function prefillPriceBuffer(
	priceBuffer: number[],
	exchangeConfig: any
) {
	// Access the binance constructor
	const exchange = new ccxt.binance();
	const symbol = exchangeConfig.symbols[0];
	const timeframe = exchangeConfig.timeframes[0];
	const limit = 6; // Fetch the last 6 candles (to exclude the open candle)

	try {
		const ohlcv = await exchange.fetchOHLCV(
			symbol,
			timeframe,
			undefined,
			limit
		);

		// Exclude the most recent candle (open candle)
		const closedCandles = ohlcv.slice(0, -1);

		closedCandles.forEach((candle: any[]) => {
			if (typeof candle[4] === "number") {
				priceBuffer.push(candle[4]); // Push closing prices
			} else {
				logger.warn(`Invalid closing price encountered: ${candle[4]}`);
			}
		});

		logger.info(
			`Pre-filled price buffer with ${priceBuffer.length} historical prices.`
		);
	} catch (error) {
		logger.error(`Failed to fetch historical data: ${error.message}`);
	}
}
