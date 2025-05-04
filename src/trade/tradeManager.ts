import { evaluateEntryConditions } from "./entryConditions";
import { calculateExitConditions, updateTrailingExit } from "./riskManager";
import logger from "../utils/logger";

let activeTrade: {
	action: "long" | "short";
	entryPrice: number;
	stopLoss: number;
	trailingExitActivation: number;
	trailingExit?: number;
} | null = null;

export function handlePriceUpdate(
	currentPrice: number,
	isCandleClosed: boolean,
	forecastedPrice: number
) {
	if (isCandleClosed) {
		logger.info(`[TradeManager] Candle closed. Waiting for next forecast.`);
		return;
	}

	if (!activeTrade) {
		// Evaluate entry conditions
		const entryDecision = evaluateEntryConditions(
			forecastedPrice,
			currentPrice
		);

		if (entryDecision.action === "long" || entryDecision.action === "short") {
			// Enter a trade
			const exitConditions = calculateExitConditions(
				entryDecision.entryPrice!,
				entryDecision.action,
				forecastedPrice
			);

			activeTrade = {
				action: entryDecision.action,
				entryPrice: entryDecision.entryPrice!,
				stopLoss: exitConditions.stopLoss,
				trailingExitActivation: exitConditions.trailingExitActivation,
			};

			logger.info(
				`Entered ${entryDecision.action.toUpperCase()} trade at ${entryDecision.entryPrice!.toFixed(
					2
				)}. Stop Loss: ${exitConditions.stopLoss.toFixed(
					2
				)}, Trailing Exit Activation: ${exitConditions.trailingExitActivation.toFixed(
					2
				)}`
			);
		}
	} else {
		// Update trailing exit for an active trade
		if (
			currentPrice >= activeTrade.trailingExitActivation &&
			activeTrade.action === "long"
		) {
			const trailingExit = updateTrailingExit(
				currentPrice,
				activeTrade.trailingExitActivation
			);

			if (trailingExit) {
				activeTrade.trailingExit = trailingExit;
				logger.info(`Updated Trailing Exit: ${trailingExit.toFixed(2)}`);
			}
		} else if (
			currentPrice <= activeTrade.trailingExitActivation &&
			activeTrade.action === "short"
		) {
			const trailingExit = updateTrailingExit(
				currentPrice,
				activeTrade.trailingExitActivation
			);

			if (trailingExit) {
				activeTrade.trailingExit = trailingExit;
				logger.info(`Updated Trailing Exit: ${trailingExit.toFixed(2)}`);
			}
		}

		// Check for stop-loss or trailing exit conditions
		if (
			(activeTrade.action === "long" &&
				(currentPrice <= activeTrade.stopLoss ||
					(activeTrade.trailingExit !== undefined &&
						currentPrice <= activeTrade.trailingExit))) ||
			(activeTrade.action === "short" &&
				(currentPrice >= activeTrade.stopLoss ||
					(activeTrade.trailingExit !== undefined &&
						currentPrice >= activeTrade.trailingExit)))
		) {
			logger.info(
				`Exited ${activeTrade.action.toUpperCase()} trade at ${currentPrice.toFixed(
					2
				)}`
			);
			activeTrade = null; // Reset active trade

			// Add a cooldown period to prevent immediate re-entry
			setTimeout(() => {
				logger.info(
					`[TradeManager] Cooldown period ended. Ready for new trades.`
				);
			}, 5000); // 5-second cooldown
		}
	}
}
