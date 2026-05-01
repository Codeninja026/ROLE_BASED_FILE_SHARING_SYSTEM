/**
 * Safe date formatter that handles null, undefined, and invalid dates.
 * Supports common format tokens: yyyy, MMM, MM, dd, HH, mm, ss
 */
export function safeFormat(dateInput, formatStr = 'MMM dd, yyyy') {
  if (!dateInput) return '—';

  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) return '—';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const pad = (n) => String(n).padStart(2, '0');

    return formatStr
      .replace('yyyy', date.getFullYear())
      .replace('MMMM', fullMonths[date.getMonth()])
      .replace('MMM', months[date.getMonth()])
      .replace('MM', pad(date.getMonth() + 1))
      .replace('dd', pad(date.getDate()))
      .replace('HH', pad(date.getHours()))
      .replace('mm', pad(date.getMinutes()))
      .replace('ss', pad(date.getSeconds()));
  } catch {
    return '—';
  }
}

/**
 * Returns a relative time string like "2 hours ago", "just now", etc.
 */
export function timeAgo(dateInput) {
  if (!dateInput) return '—';

  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) return '—';

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return safeFormat(date, 'MMM dd');
  } catch {
    return '—';
  }
}

export function formatFileSize(bytes) {
  if (bytes == null || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
