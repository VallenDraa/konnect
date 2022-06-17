export default function PicturelessProfile({ initials, bgColor, width }) {
  console.log(bgColor);
  return (
    <span
      className="text-6xl font-bold uppercase rounded-full aspect-square  grid place-items-center shadow-md text-gray-800"
      style={{ backgroundColor: bgColor, width, fontSize: `${width / 3}px` }}
    >
      {initials}
    </span>
  );
}
