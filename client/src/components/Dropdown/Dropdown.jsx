import { useContext } from "react";
import { useEffect, useRef, useState } from "react";
import {
  replaceCss,
  SettingsContext,
} from "../../context/settingsContext/SettingsContext";
import checkInjectedClasses from "../../utils/tailwindClasses/checkInjectedClasses";
import NotifBadge from "../NotifBadge/NotifBadge";

export default function Dropdown({
  className = "",
  btnClassName = "",
  listClassName = "",
  offset = 0,
  listStyle = {},
  children,
  icon,
  text,
  notifBadgeContent,
  position,
  fontSize,
}) {
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const [open, setOpen] = useState(false);
  const dropDownWrapper = useRef();
  const dropDown = useRef();
  const btn = useRef();
  const [btnOffsetHeight, setBtnOffsetHeight] = useState(0);
  const [defaultClasses, setDefaultClasses] = useState([
    "relative",
    "flex",
    "justify-center",
    "items-center",
  ]);
  const [btnDefaultClasses, setBtnDefaultClasses] = useState([
    "relative",
    "font-medium",
    "py-1",
    "px-3",
    "capitalize",
    "hover:text-pink-400",
    "rounded-full",
    "flex",
    "items-center",
    "gap-x-1",
    "bg-gray-200",
    "hover:bg-gray-100",
    "shadow-sm",
    "hover:shadow-md",
    "active:shadow",
    `${general?.animation ? `duration-200` : ``}`,
  ]);
  const [listDefaultClasses, setListDefaultClasses] = useState([
    "z-30",
    "absolute",
    "max-h-[18rem]",
    "w-72",
    "sm:w-60",
    "bg-gray-50",
    "shadow-md",
    "rounded-lg",
    "p-2",
    "flex",
    "flex-col",
    "gap-y-2",
    "overflow-y-auto",
    "border-2",
    "border-gray-200",
    `${general?.animation ? `animate-d-down-open` : `open`}`,
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

  // auto close dropdown
  useEffect(() => {
    const autoCloseDropdown = (e) => {
      if (!dropDown.current) return;

      [...dropDown.current.children].forEach((child) => {
        if (!dropDown.current.contains(e.target) || child.contains(e.target)) {
          if (general?.animation) {
            if (!dropDown.current.classList.contains("animate-d-down-open")) {
              dropDown.current.classList.add("animate-d-down-close");
              setTimeout(() => setOpen(false), 195);
            }
          } else {
            if (e.target !== btn.current) setOpen(false);
          }
        }
      });
    };
    window.addEventListener("click", autoCloseDropdown);

    return () => {
      window.removeEventListener("click", autoCloseDropdown);
    };
  }, [dropDown, general]);

  // setting the button offset
  useEffect(() => {
    if (!btn.current) return;
    setBtnOffsetHeight(btn.current.offsetHeight);
  }, [btn]);

  // for adding or removing list animation when setting changes
  useEffect(() => {
    setBtnDefaultClasses((prev) =>
      replaceCss(prev, general?.animation ? "duration-200" : "")
    );

    setListDefaultClasses((prev) =>
      replaceCss(prev, general?.animation ? "animate-d-down-open" : "open")
    );
  }, [general]);

  const handleOpen = () => {
    if (!open) {
      setOpen(true);

      if (general?.animation) {
        setTimeout(
          () => dropDown.current?.classList.remove("animate-d-down-open"),
          200
        );
      } else {
        dropDown.current?.classList.remove("open");
      }
    } else {
      if (general?.animation) {
        if (!dropDown.current?.classList.contains("animate-d-down-open")) {
          dropDown.current?.classList.add("animate-d-down-close");
          setTimeout(() => setOpen(false), 195);
        }
      } else {
        dropDown.current?.classList.add("close");
        setOpen(false);
      }
    }
  };

  return (
    <>
      <div
        ref={dropDownWrapper}
        className={`${defaultClasses.join(" ")} ${className}`}
      >
        <button
          ref={btn}
          onClick={handleOpen}
          className={`${btnDefaultClasses.join(" ")} ${btnClassName}`}
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
              " "
            )} ${listClassName}`}
            style={{ top: `${btnOffsetHeight + offset + 1}px`, ...listStyle }}
          >
            {children}
          </ul>
        )}
      </div>
    </>
  );
}
