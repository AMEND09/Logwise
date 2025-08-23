// Helpers for working with local dates (YYYY-MM-DD) to avoid UTC offset issues
export const toLocalISODate = (d?: Date): string => {
  const date = d ? new Date(d) : new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Parse a YYYY-MM-DD string into a Date at local midnight
export const parseLocalDate = (isoDate: string): Date => {
  if (!isoDate) return new Date();
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
};

export default toLocalISODate;
