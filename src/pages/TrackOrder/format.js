/**
 * Date / time formatting helpers for the TrackOrder feature.
 * Kept tiny + pure so they can be reused or tested in isolation.
 */

const DATE_FORMAT  = { month: 'short', day: 'numeric', year: 'numeric' };
const DATETIME_FMT = { ...DATE_FORMAT, hour: '2-digit', minute: '2-digit' };

/**
 * Formats a date string / timestamp into a human-readable date.
 * Pass `withTime = true` to include hours + minutes.
 */
export const formatDate = (input, withTime = false) => {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input; // pass-through for pre-formatted strings
  return d.toLocaleDateString('en-US', withTime ? DATETIME_FMT : DATE_FORMAT);
};

/**
 * Returns just the time portion (e.g. "10:30 AM").
 */
export const formatTime = (input) => {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};
