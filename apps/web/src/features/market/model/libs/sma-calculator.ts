export const calculateSMA = (prices: number[], period: number): (number | null)[] => {
  const sma = Array(prices.length).fill(null);

  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma[i] = sum / period;
  }

  return sma;
};
