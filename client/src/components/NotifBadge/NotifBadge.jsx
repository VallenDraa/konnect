import useCheckMobile from "../../utils/React/hooks/useCheckMobile/useCheckMobile";

export default function NotifBadge({
  children,
  isActive,
  size = 20,
  style,
  textOffset,
}) {
  return (
    <>
      {isActive && (
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            fontSize: `${(parseInt(size) * 65) / 100}px`,
            ...style,
          }}
          className="rounded-full absolute bg-red-500 text-white grid place-content-center aspect-square"
        >
          <span
            className="relative"
            style={{ top: textOffset.top, right: textOffset.right }}
          >
            {children}
          </span>
        </div>
      )}
    </>
  );
}
