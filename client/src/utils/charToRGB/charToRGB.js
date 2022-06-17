/**
 *
 * @param  {...String} args
 * @returns
 */

export default function charToRGB(...args) {
  const result = [];

  for (const arg of args) {
    for (let i = 0; i < arg.length; i++) {
      const number = arg[i].charCodeAt(0) <= 256 ? arg[i].charCodeAt(0) : 256;
      result.push(number);
    }
  }

  return result;
}
