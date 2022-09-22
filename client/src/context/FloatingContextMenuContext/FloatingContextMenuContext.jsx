import { useRef } from "react";
import { createContext, useState } from "react";
import _ from "lodash";
import { useContext } from "react";
import { SettingsContext } from "../settingsContext/SettingsContext";

export const FCMContext = createContext(false);

export default function FCMContextProvider({ children }) {
  const FCMWrapperRef = useRef(); // used for the parent element of the FCM to make sure thet the FCM is not off-screen
  const FCMRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  const openContextMenu = _.throttle((e) => {
    FCMRef.current.classList.remove("animate-context-menu-open");
    FCMRef.current.classList.remove("animate-context-menu-close");

    e.preventDefault();
    setIsOpen(true);

    const { offsetHeight: FCMHeight, offsetWidth: FCMWidth } = FCMRef.current;
    const { height: wrapperHeight, width: wrapperWidth } =
      FCMWrapperRef.current.getBoundingClientRect();

    const newX =
      e.clientX + FCMWidth > wrapperWidth ? e.clientX - FCMWidth : e.clientX;
    const newY =
      e.clientY + FCMHeight > wrapperHeight ? e.clientY - FCMHeight : e.clientY;

    setPos({ x: newX, y: newY });

    if (general?.animation) {
      FCMRef.current.classList.add("animate-context-menu-open");

      setTimeout(() => {
        FCMRef.current.classList.remove("animate-context-menu-open");
      }, 150);
    }
  }, 2000);

  const closeContextMenuOnClick = _.throttle((e) => {
    if (!FCMRef.current?.contains(e.target)) {
      if (!general?.animation) {
        setIsOpen(false);
      } else {
        FCMRef.current.classList.add("animate-context-menu-close");
        setTimeout(() => setIsOpen(false), 140);
        setTimeout(
          () => FCMRef.current.classList.remove("animate-context-menu-close"),
          150
        );
      }
    }
  }, 2000);

  const closeContextMenu = _.throttle(() => {
    if (isOpen) {
      if (!general?.animation) {
        setIsOpen(false);
      } else {
        FCMRef.current.classList.add("animate-context-menu-close");
        setTimeout(() => setIsOpen(false), 140);
        setTimeout(
          () => FCMRef.current.classList.remove("animate-context-menu-close"),
          150
        );
      }
    }
  }, 2000);

  return (
    <FCMContext.Provider
      value={{
        isOpen,
        pos,
        FCMWrapperRef,
        FCMRef,
        openContextMenu,
        closeContextMenuOnClick,
        closeContextMenu,
      }}
    >
      {children}
    </FCMContext.Provider>
  );
}
