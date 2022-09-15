/**
 *
 * @param {HTMLElement} element
 */
export function scrollToBottom(element) {
  element.scrollTop = element.scrollHeight;
}

/**
 *
 * @param {HTMLElement} element
 */
export function scrollToBottomSmooth(element) {
  element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
}
