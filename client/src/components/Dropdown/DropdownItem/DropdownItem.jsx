export default function DropdownItem({
  children,
  className,
  isActive,
  onClick,
}) {
  return (
    <li
      onClick={onClick}
      className={`${className || ''} w-full px-2 py-3 text-xs ${
        isActive
          ? 'bg-gray-200 text-blue-400 font-semibold'
          : 'hover:bg-gray-100 active:bg-gray-200 text-gray-400'
      } duration-200 cursor-pointer`}
    >
      {children}
    </li>
  );
}
