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
 * @param {Date} timeSent
 * @returns
 */

export const getSentAtStatus = (now, timeSent) => {
  let sentAt;

  const currDate = now.getDate();
  const timeSentDate = timeSent.getDate();
  const currMonthAndYear = `${now.getMonth()}/${now.getFullYear()}`;
  const timeSentMonthAndYear = `${timeSent.getMonth()}/${timeSent.getFullYear()}`;

  // determine the time at which the message was sent
  if (currDate === timeSentDate) {
    sentAt = 'today';
  } else if (
    currDate > timeSentDate &&
    currDate - timeSentDate === 1 &&
    currMonthAndYear === timeSentMonthAndYear
  ) {
    sentAt = 'yesterday';
  } else {
    sentAt = 'long ago';
  }

  return sentAt;
};

/**
 *
 * @param {Date} now
 * @param {Date} timeSent
 * @returns
 */
export const chatPreviewTimeStatus = (now, timeSent) => {
  const sentAt = getSentAtStatus(now, timeSent);

  // determine the time indicator that'll be displayed
  switch (sentAt) {
    case 'today':
      const formattedTime = timeSent
        .toTimeString()
        .slice(0, timeSent.toTimeString().lastIndexOf(':'));

      return formattedTime;

    case 'yesterday':
      return 'Yesterday';

    case 'long ago':
      return timeSent.toLocaleDateString();
    default:
      return timeSent.toLocaleDateString();
  }
};
