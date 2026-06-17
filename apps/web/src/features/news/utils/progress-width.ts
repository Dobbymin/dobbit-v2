export const getWidthStyle = (count: number, total: number) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return { width: `${percentage}%` };
};
