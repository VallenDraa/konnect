import { useEffect, useRef, useState } from 'react';
import NotifBadge from '../NotifBadge/NotifBadge';

export default function Dropdown({
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

  useEffect(() => {
    const autoCloseDropdown = (e) => {
      if (!dropDown.current) return;

      [...dropDown.current.children].forEach((child) => {
        if (!dropDown.current.contains(e.target) || child.contains(e.target)) {
          if (!dropDown.current.classList.contains('animate-d-down-open')) {
            dropDown.current.classList.add('animate-d-down-close');
            setTimeout(() => setOpen(false), 195);
          }
        }
      });
    };
    window.addEventListener('click', (e) => autoCloseDropdown(e));

    return () => {
      window.removeEventListener('click', (e) => autoCloseDropdown(e));
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
        className="relative flex justify-center items-center"
      >
        <button
          ref={btn}
          onClick={handleOpen}
          className="relative font-semibold py-1 px-3 capitalize hover:text-pink-400 duration-200 rounded flex items-center gap-x-1 border-2 border-gray-300 shadow"
          style={{ fontSize }}
        >
          {icon}
          {text}
          {notifBadgeContent && <NotifBadge>{notifBadgeContent}</NotifBadge>}
        </button>

        {open && (
          <ul
            ref={dropDown}
            className={`${position} z-30 absolute max-h-[18rem] w-72 sm:w-60 bg-gray-50 shadow-md rounded p-1 divide-y-2 animate-d-down-open overflow-y-auto border-2 border-gray-200`}
            style={{
              top: `${btnOffsetHeight + 2}px`,
            }}
          >
            {children}
          </ul>
        )}
      </div>
    </>
  );
}
