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

  // Upbit KRW 최소 호가단위는 1e-8이므로 1 미만 단가는 소수 최대 8자리로 표시(후행 0 제거)
  return value.toLocaleString("ko-KR", { maximumFractionDigits: 8 });
};
