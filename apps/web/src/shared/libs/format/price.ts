export const formatPrice = (value: number, currency = "KRW") =>
  new Intl.NumberFormat("ko-KR", {
    style: "decimal",
    maximumFractionDigits: currency === "KRW" ? 0 : 8,
  }).format(value);

export const formatCoinPrice = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) {
    return "0";
  }

  if (value >= 1) {
    return value.toLocaleString("ko-KR");
  }

  const decimals = Math.min(8, -Math.floor(Math.log10(value)) + 3);
  return value.toLocaleString("ko-KR", { maximumFractionDigits: decimals });
};
