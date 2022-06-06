export default function DropdownItem({ children, className }) {
  return (
    <li
      className={`${
        className || ''
      } w-full px-2 py-3 text-xs hover:bg-gray-200 active:bg-gray-300 duration-200 text-slate-600 cursor-pointer`}
    >
      {children}
    </li>
  );
}
