import { multiply, transpose, inv } from "mathjs";

/**
 * Fits a linear regression model using least squares.
 * Returns the coefficients (beta values).
 */
export function linearRegressionFit(X: number[][], y: number[]): number[] {
	const X_T = transpose(X);
	const XTX = multiply(X_T, X);
	const XTy = multiply(X_T, y);

	const beta = multiply(inv(XTX), XTy) as unknown as number[][];
	return beta.map((row) => row[0]); // flatten to 1D array
}

/**
 * Uses learned beta coefficients to predict a single output value.
 */
export function linearRegressionPredict(
	input: number[],
	beta: number[]
): number {
	return input.reduce((sum, val, i) => sum + val * beta[i], 0);
}
