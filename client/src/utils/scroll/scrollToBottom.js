/**
 *
 * @param {HTMLElement} element
 */
export function scrollToBottom(element) {
  // console.trace("rigid");
  element.scrollTop = element.scrollHeight;
}

/**
 *
 * @param {HTMLElement} element
 */
export function scrollToBottomSmooth(element) {
  element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
}
