// FILE: src/lib/utils.js
/**
 * Formats an ISO date string into a more readable format.
 * @param {string | null} isoString The date string to format.
 * @returns {string} Formatted date string or 'N/A'.
 */
export const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString));
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Clamps a number between a minimum and maximum value.
 * @param {number} value The number to clamp.
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @returns {number} The clamped number.
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
