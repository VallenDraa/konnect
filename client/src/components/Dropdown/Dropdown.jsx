import { useEffect, useRef, useState } from 'react';
import throttle from '../../utils/performance/throttle';
import checkInjectedClasses from '../../utils/tailwindClasses/checkInjectedClasses';
import NotifBadge from '../NotifBadge/NotifBadge';

export default function Dropdown({
  className = '',
  btnClassName = '',
  listClassName = '',
  listStyle = {},
  children,
  icon,
  text,
  notifBadgeContent,
  position,
  fontSize,
}) {
  const [open, setOpen] = useState(false);
  const dropDownWrapper = useRef();
  const dropDown = useRef();
  const btn = useRef();
  const [btnOffsetHeight, setBtnOffsetHeight] = useState(0);
  const [defaultClasses, setDefaultClasses] = useState([
    'relative',
    'flex',
    'justify-center',
    'items-center',
  ]);
  const [btnDefaultClasses, setBtnDefaultClasses] = useState([
    'relative',
    'font-semibold',
    'py-1',
    'px-3',
    'capitalize',
    'hover:text-pink-400',
    'duration-200',
    'rounded',
    'flex',
    'items-center',
    'gap-x-1',
    'border-2',
    'border-gray-300',
    'shadow',
  ]);
  const [listDefaultClasses, setListDefaultClasses] = useState([
    'z-30',
    'absolute',
    'max-h-[18rem]',
    'w-72',
    'sm:w-60',
    'bg-gray-50',
    'shadow-md',
    'rounded',
    'p-1',
    'divide-y-2',
    'animate-d-down-open',
    'overflow-y-auto',
    'border-2',
    'border-gray-200',
  ]);

  // filter duplicate classes
  useEffect(() => {
    className = checkInjectedClasses({
      injectedClasses: className,
      defClassGetter: defaultClasses,
      defClassSetter: setDefaultClasses,
    });

    btnClassName = checkInjectedClasses({
      injectedClasses: btnClassName,
      defClassGetter: btnDefaultClasses,
      defClassSetter: setBtnDefaultClasses,
    });
    listClassName = checkInjectedClasses({
      injectedClasses: listClassName,
      defClassGetter: listDefaultClasses,
      defClassSetter: setListDefaultClasses,
    });
  }, []);

  useEffect(() => {
    const autoCloseDropdown = throttle((e) => {
      if (!dropDown.current) return;

      [...dropDown.current.children].forEach((child) => {
        if (!dropDown.current.contains(e.target) || child.contains(e.target)) {
          if (!dropDown.current.classList.contains('animate-d-down-open')) {
            dropDown.current.classList.add('animate-d-down-close');
            setTimeout(() => setOpen(false), 195);
          }
        }
      });
    }, 500);
    window.addEventListener('click', autoCloseDropdown);

    return () => {
      window.removeEventListener('click', autoCloseDropdown);
    };
  }, [dropDown]);

  useEffect(() => {
    if (!btn.current) return;
    setBtnOffsetHeight(btn.current.offsetHeight);
  }, [btn]);

  const handleOpen = () => {
    if (!open) {
      setOpen(true);

      setTimeout(
        () => dropDown.current?.classList.remove('animate-d-down-open'),
        200
      );
    } else {
      if (!dropDown.current?.classList.contains('animate-d-down-open')) {
        dropDown.current?.classList.add('animate-d-down-close');
        setTimeout(() => setOpen(false), 195);
      }
    }
  };

  return (
    <>
      <div
        ref={dropDownWrapper}
        className={`${defaultClasses.join(' ')} ${className}`}
      >
        <button
          ref={btn}
          onClick={handleOpen}
          className={`${btnDefaultClasses.join(' ')} ${btnClassName}`}
          style={{ fontSize }}
        >
          {icon}
          {text}
          {notifBadgeContent && <NotifBadge>{notifBadgeContent}</NotifBadge>}
        </button>

        {open && (
          <ul
            ref={dropDown}
            className={`${position} ${listDefaultClasses.join(
              ' '
            )} ${listClassName}`}
            style={{ top: `${btnOffsetHeight + 1}px`, ...listStyle }}
          >
            {children}
          </ul>
        )}
      </div>
    </>
  );
}
