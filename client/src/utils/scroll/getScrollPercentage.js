/**

element.scrollTop - is the pixels hidden in top due to the scroll. With no scroll its value is 0.

element.scrollHeight - is the pixels of the whole div.

element.clientHeight - is the pixels that you see in your browser.

 */
/**
 *
 * @param {HTMLElement} htmlElement
 * @returns
 */

export default function getScrollPercentage(htmlElement) {
  const pos = htmlElement.scrollTop;
  const scrollTopMax = htmlElement.scrollHeight - htmlElement.clientHeight;

  const percentage = (pos / scrollTopMax) * 100;

  return percentage;
}

/**
 *
 * @param {HTMLElement} htmlElement
 * @returns
 */
export const isElementScrollable = (htmlElement) => {
  return htmlElement.scrollHeight > htmlElement.clientHeight;
};
