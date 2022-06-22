import { useState } from 'react';

export default function PicturelessProfile({ initials, bgColor, width }) {
  return (
    <span
      className="text-6xl font-bold uppercase rounded-full aspect-square grid place-items-center shadow-md text-orange-500"
      style={{
        backgroundColor: `${
          typeof bgColor === 'function' ? bgColor() : bgColor
        }`,
        width,
        fontSize: `${width / 3}px`,
      }}
    >
      {initials}
    </span>
  );
}
