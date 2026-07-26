const isFiniteNumber = (value: string) => value !== "" && Number.isFinite(Number(value));

export const calculateOrderTotal = (price: string, amount: string): string => {
  if (!isFiniteNumber(price) || !isFiniteNumber(amount) || Number(price) <= 0) return "";

  return String(Math.round(Number(price) * Number(amount)));
};

export const calculateOrderAmount = (price: string, total: string): string => {
  if (!isFiniteNumber(price) || !isFiniteNumber(total) || Number(price) <= 0) return "";

  return String(Number(total) / Number(price));
};
