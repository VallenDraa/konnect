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
          className={`py-1 w-full text-xxs border-2 shadow-md hover:shadow-xl active:shadow-inner rounded-full flex items-center gap-1 justify-center duration-200  ${className}`}
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
          className={`py-1 w-full border-2 shadow-md hover:shadow-xl active:shadow-inner rounded-full flex items-center gap-1 justify-center duration-200  ${className}`}
        >
          {children}
        </Link>
      </RenderIf>
    </>
  );
}
