import { useEffect, useRef, useState } from "react";

/**
 * @returns onClick function returns a true or false on the first argument
 */
export default function SwitchBtn({
  icon1,
  icon2,
  onClick,
  className = "",
  on = false,
}) {
  const thumbRef = useRef();
  const switchRef = useRef();
  const [isActive, setIsActive] = useState(on);

  useEffect(() => {
    if (!thumbRef.current) return;

    switch (on) {
      case true:
        thumbRef.current.classList.add("translate-x-full");
        thumbRef.current.classList.add("bg-pink-300");
        break;
      case false:
        thumbRef.current.classList.add("bg-blue-300");
        break;
      default:
        thumbRef.current.classList.add("bg-blue-300");
        break;
    }
  }, [thumbRef]);

  const handleThumb = () => {
    const classList = thumbRef.current.classList;
    if (classList.contains("translate-x-full")) {
      classList.remove("translate-x-full");
      classList.remove("bg-pink-300");
      classList.add("bg-blue-300");
    } else {
      classList.add("translate-x-full");
      classList.remove("bg-blue-300");
      classList.add("bg-pink-300");
    }
  };

  return (
    <button
      ref={switchRef}
      onClick={() => {
        setIsActive(!isActive);
        onClick && onClick(isActive);
        handleThumb();
      }}
      className={`relative py-1 px-3 rounded-full cursor-pointer duration-200 shadow flex items-center justify-between w-[65px] aspect-[3/1] ${className}`}
    >
      {/* thumb */}
      <div
        ref={thumbRef}
        className="absolute h-full w-1/2 duration-200 rounded-full shadow transform left-0"
      ></div>
      {/* icons */}
      <span>{icon1}</span>
      <span>{icon2}</span>
    </button>
  );
}
