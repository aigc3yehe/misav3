export const formatId = (id: number | string): string => {
  return `#${id.toString().padStart(4, '0')}`;
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000); // 转换为毫秒
  return date.toISOString().split('T')[0]; // 返回 YYYY-MM-DD 格式
};

export const formatDateRange = (start?: number, end?: number): string => {
  if (!start || !end) return '';
  return `${formatDate(start)}~${formatDate(end)}`;
}; 