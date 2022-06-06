import { useEffect, useRef, useState } from 'react';
import NotifBadge from '../NotifBadge/NotifBadge';

export default function Dropdown({ children, icon, notifBadgeContent }) {
  const [open, setOpen] = useState(false);
  const dropDownWrapper = useRef();
  const dropDown = useRef();

  useEffect(() => {
    const autoCloseDropdown = (e) => {
      if (!dropDown.current?.contains(e.target)) {
        if (!dropDown.current?.classList.contains('animate-d-down-open')) {
          dropDown.current?.classList.add('animate-d-down-close');
          setTimeout(() => setOpen(false), 195);
        }
      }
    };

    window.addEventListener('click', (e) => autoCloseDropdown(e));

    return () => {
      window.removeEventListener('click', (e) => autoCloseDropdown(e));
    };
  }, [dropDown]);

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
          onClick={handleOpen}
          className="relative text-lg p-2 hover:text-pink-400 duration-200 rounded-lg"
        >
          {icon}
          {notifBadgeContent && <NotifBadge>{notifBadgeContent}</NotifBadge>}
        </button>

        {open && (
          <ul
            ref={dropDown}
            className="origin-top-right z-30 absolute max-h-[18rem] w-72 sm:w-60 bg-gray-50 shadow-md right-0 top-10 rounded p-1 divide-y-2 animate-d-down-open overflow-y-auto border-2 border-gray-200"
          >
            {children}
          </ul>
        )}
      </div>
    </>
  );
}
