/**

element.scrollTop - is the pixels hidden in top due to the scroll. With no scroll its value is 0.

element.scrollHeight - is the pixels of the whole div.

element.clientHeight - is the pixels that you see in your browser.

 */

export default function getScrollPercentage() {
  const pos = document.documentElement.scrollTop;
  const scrollTopMax =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  const percentage = (pos / scrollTopMax) * 100;

  return percentage;
}

export const isWindowScrollable = () => {
  return (
    document.documentElement.scrollHeight >
    document.documentElement.clientHeight
  );
};
