import charToRGB from '../charToRGB/charToRGB';

export default function generateRgb(initials) {
  const rgbNum = charToRGB(initials.split(''));
  const result = {
    r: rgbNum[0],
    g: rgbNum[1] || rgbNum[0] + rgbNum[0] <= 200 ? rgbNum[0] + rgbNum[0] : 200,
    b: rgbNum[2] || rgbNum[0] + rgbNum[1] <= 200 ? rgbNum[0] + rgbNum[1] : 200,
  };

  return `rgb(${result.r} ${result.g} ${result.b})`;
}
