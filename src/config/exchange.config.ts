export default {
	exchanges: ["binance"],
	symbols: ["BTC/USDT"],
	timeframes: ["4h"],
	candleLimit: 100,
	apiKey: process.env.BINANCE_API_KEY,
	apiSecret: process.env.BINANCE_API_SECRET,
};
