export const formatThousands = (value: string | number): string => {
  if (value === "" || value === null || value === undefined) return "";

  const str = String(value);
  const parts = str.split(".");
  const integerPart = parts[0]?.replace(/\D/g, "") || "";
  const decimalPart = parts[1] || "";

  if (!integerPart) return "";

  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.length > 1 ? `${formatted}.${decimalPart}` : formatted;
};

export const parseNumericInput = (value: string): string => {
  if (value === "") return "";
  const cleaned = value.replace(/,/g, "");
  return cleaned.replace(/[^\d]/g, "");
};

export const parseNumericInputWithDecimal = (value: string): string => {
  if (value === "") return "";
  const cleaned = value.replace(/,/g, "");
  // 숫자와 소수점만 허용, 중복 소수점 제거
  return cleaned.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
};
