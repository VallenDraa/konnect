/**
 *
 * @param {HTMLElement} element
 */

export default function scrollToBottom(element) {
  if (element.scrollTo) {
    element.scrollTo({ top: element.scrollHeight });
  } else {
    element.scrollTop = element.scrollHeight;
  }
}
