/**
 *
 * @param {Function} cb
 * @param {Number} delay
 */

export default function throttle(cb, delay = 1000) {
  let lastTime = 0;

  return (...args) => {
    const now = new Date().getTime();

    if (now - lastTime < delay) return;

    cb(...args);
    lastTime = now;
  };
}
