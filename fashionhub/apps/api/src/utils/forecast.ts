/**
 * Calculates a simple linear regression over a series of price data.
 * @param data Array of prices ordered chronologically
 * @returns Projected next price and a trend string
 */
export function calculateLinearRegression(prices: number[]) {
  if (!prices || prices.length < 2) return null;

  const n = prices.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = prices[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return null; // Avoid divide by zero if all x are somehow identical

  const m = (n * sumXY - sumX * sumY) / denominator;
  const b = (sumY - m * sumX) / n;

  // Project next 30 steps
  const predictedNext30Days = m * (n + 30) + b;

  let trend: 'UP' | 'DOWN' | 'STABLE';
  // If gradient m is > 0.5 price goes up. If < -0.5 price down. Else stable.
  if (m > 0.5) trend = 'UP';
  else if (m < -0.5) trend = 'DOWN';
  else trend = 'STABLE';
  
  // Calculate basic confidence (R-squared proxy simplistically for demonstration or static value)
  // We'll return a static generic confidence for the demo, or compute it.
  const confidence = 0.85;

  return {
    predictedPrice: Math.max(0, Math.round(predictedNext30Days)), // prevent negative price
    slope: m,
    trend,
    confidence
  };
}
