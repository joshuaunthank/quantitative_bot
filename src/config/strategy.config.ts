const strategyConfig = {
	indicators: {
		rsi: {
			period: 14,
			overbought: 70,
			oversold: 30,
		},
		ema: {
			shortPeriod: 12,
			longPeriod: 26,
			signalPeriod: 9,
		},
		macd: {
			shortPeriod: 12,
			longPeriod: 26,
			signalPeriod: 9,
		},
		lags: {
			period: 4,
		},
		coefficients: [0.5, 0.3, 0.1, 0.1], // Added coefficients property
	},
	threshold: 0.5,
};
export default strategyConfig;
