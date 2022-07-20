import { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import RenderIf from '../../../utils/React/RenderIf';
import checkInjectedClasses from '../../../utils/tailwindClasses/checkInjectedClasses';

export default function DropdownItem({
  children,
  className = '',
  isActive,
  onClick,
  to,
}) {
  const [defaultClasses, setDefaultClasses] = useState(`
  text-xs duration-200 cursor-pointer rounded
  ${!to ? 'w-full px-2 py-3 flex items-center gap-x-1' : ''}
  ${isActive ? 'bg-gray-200' : 'active:bg-gray-200'}
  ${isActive ? 'shadow' : 'hover:shadow-sm'}
  ${isActive ? 'text-blue-400' : 'text-gray-400'}
  ${isActive ? 'font-semibold' : ''}
  ${isActive ? '' : 'hover:bg-gray-100'}
  `);

  useEffect(() => {
    className = checkInjectedClasses({
      injectedClasses: className,
      defClassGetter: defaultClasses,
      defClassSetter: setDefaultClasses,
    });
  }, []);

  return (
    <li onClick={onClick} className={`${className} ${defaultClasses}`}>
      <RenderIf conditionIs={!to}>{children}</RenderIf>
      <RenderIf conditionIs={to}>
        <Link to={to} className="w-full px-2 py-3 flex items-center gap-x-1">
          {children}
        </Link>
      </RenderIf>
    </li>
  );
}
