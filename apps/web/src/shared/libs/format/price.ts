export const formatPrice = (value: number, currency = "KRW") =>
  new Intl.NumberFormat("ko-KR", {
    style: "decimal",
    maximumFractionDigits: currency === "KRW" ? 0 : 8,
  }).format(value);
