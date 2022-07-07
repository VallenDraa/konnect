import emojiRegex from 'emoji-regex';

/**
 *
 * @param  {String} args
 */
export default function emojiTest(args) {
  const emojiTestRegex = emojiRegex();
  let isUsingEmoji = false;

  // test if input has emojis
  for (const arg of args) {
    isUsingEmoji = arg.match(emojiTestRegex);
    if (isUsingEmoji) break;
  }

  return isUsingEmoji;
}
