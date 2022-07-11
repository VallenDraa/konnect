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
 * @param {Date} now
 * @param {Date} then
 * @returns
 */

export function getSentAtStatus(now, then) {
  let sentAt;

  const currDate = now.getDate();
  const thenDate = then.getDate();
  const currMonthAndYear = `${now.getMonth()}/${now.getFullYear()}`;
  const thenMonthAndYear = `${then.getMonth()}/${then.getFullYear()}`;

  // determine the time at which the message was sent
  if (currDate === thenDate) {
    sentAt = 'today';
  } else if (
    currDate > thenDate &&
    currDate - thenDate === 1 &&
    currMonthAndYear === thenMonthAndYear
  ) {
    sentAt = 'yesterday';
  } else {
    sentAt = 'long ago';
  }

  return sentAt;
}
