import { Link } from 'react-router-dom';
import RenderIf from '../../../utils/React/RenderIf';

export default function DropdownItem({
  children,
  className,
  isActive,
  onClick,
  to,
}) {
  return (
    <li
      onClick={onClick}
      className={`${className || ''} 
      ${!to ? 'w-full px-2 py-3 flex items-center gap-x-1' : ''}
      ${isActive ? 'bg-gray-200' : 'active:bg-gray-200'}
      ${isActive ? 'text-blue-400' : 'text-gray-400'}
      ${isActive ? 'font-semibold' : ''}
      ${isActive ? '' : 'hover:bg-gray-100'}
      text-xs duration-200 cursor-pointer`}
    >
      <RenderIf conditionIs={!to}>{children}</RenderIf>
      <RenderIf conditionIs={to}>
        <Link to={to} className="w-full px-2 py-3 flex items-center gap-x-1">
          {children}
        </Link>
      </RenderIf>
    </li>
  );
}
