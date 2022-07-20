import { useState } from 'react';
import { Link } from 'react-router-dom';
import RenderIf from '../../utils/React/RenderIf';

export default function Pill({
  className,
  children,
  onClick,
  style,
  type = 'button',
  disabled = false,
  link,
}) {
  const [defaultClasses] = useState(
    'py-2 px-3 w-full shadow-md hover:shadow-lg active:shadow-inner rounded-full flex items-center gap-1 justify-center duration-200 text-xs'
  );

  return (
    <>
      <RenderIf conditionIs={!link}>
        <button
          disabled={disabled}
          type={type}
          style={style}
          onClick={() => {
            if (typeof onClick === 'function') !disabled && onClick();
          }}
          className={`${defaultClasses} ${className}`}
        >
          {children}
        </button>
      </RenderIf>
      <RenderIf conditionIs={link}>
        <Link
          to={link}
          disabled={disabled}
          type={type}
          style={style}
          onClick={() => {
            if (typeof onClick === 'function') !disabled && onClick();
          }}
          className={`${defaultClasses} ${className}`}
        >
          {children}
        </Link>
      </RenderIf>
    </>
  );
}
