export default function Pill({
  className,
  children,
  onClick,
  style,
  type = "button",
  disabled = false,
}) {
  return (
    <button
      disabled={disabled}
      type={type}
      style={style}
      onClick={() => !disabled && onClick()}
      className={`py-1 w-full text-xxs border-2 shadow-sm active:shadow-inner rounded-full flex items-center gap-1 justify-center duration-200  ${className}`}
    >
      {children}
    </button>
  );
}
