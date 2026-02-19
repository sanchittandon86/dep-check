/**
 * Mock FX rates relative to USD.
 * To convert from currency A to B: amount * (rates[B] / rates[A])
 */
const fxRates = {
  USD: 1.0,
  EUR: 0.92,
  CHF: 0.88,
  GBP: 0.79,
  JPY: 149.5,
  INR: 83.12,
};

export function getRate(fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return null;
  const rate = fxRates[toCurrency] / fxRates[fromCurrency];
  return Math.round(rate * 10000) / 10000;
}

export default fxRates;
