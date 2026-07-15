export const formatThousands = (value: string | number): string => {
  if (value === "" || value === null || value === undefined) return "";

  const str = String(value);
  const parts = str.split(".");
  const integerPart = parts[0]?.replace(/\D/g, "") || "";
  const decimalPart = parts[1] || "";

  if (!integerPart) return "";

  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart ? `${formatted}.${decimalPart}` : formatted;
};

export const parseNumericInput = (value: string): string => {
  if (value === "") return "";
  const cleaned = value.replace(/,/g, "");
  return cleaned.replace(/[^\d]/g, "");
};
