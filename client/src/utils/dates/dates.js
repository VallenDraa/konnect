/**
 *
 * @param {Date} now
 * @param {Date} then
 */

export function getDayDifference(now, then) {
  const milisecondDifference = Math.abs(now - then);
  return milisecondDifference / (1000 * 60 * 60 * 24);
}

/**
 *
 * @param {Date} messageTime
 * @returns
 */
