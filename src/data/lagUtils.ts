/**
 * Creates a lagged feature matrix for time series data.
 * Each row is [x_t-1, x_t-2, ..., x_t-n]
 */
export function createLaggedSeries(data: number[], lags: number): number[][] {
	const lagged: number[][] = [];

	for (let i = lags; i < data.length; i++) {
		const row: number[] = [];
		for (let j = 1; j <= lags; j++) {
			row.push(data[i - j]);
		}
		lagged.push(row);
	}

	return lagged;
}
