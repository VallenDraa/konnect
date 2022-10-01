import { useContext } from "react";
import { Link } from "react-router-dom";
import { FCMContext } from "../../context/FCMContext/FCMContext";
import { SettingsContext } from "../../context/settingsContext/SettingsContext";
import RenderIf from "../../utils/React/RenderIf";

export default function FCMItem({
  style,
  className,
  children,
  onClick,
  link = null,
}) {
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const { closeContextMenu } = useContext(FCMContext);

  return (
    <>
      <RenderIf conditionIs={link}>
        <Link
          aria-label="floating-context-menu-item"
          onClick={(e) => {
            onClick && onClick(e);
            closeContextMenu();
          }}
          className={`${className} block cursor-pointer p-2 text-sm text-gray-600 hover:bg-gray-100 active:bg-gray-200 duration-200 ${
            general?.animation ? "duration-200" : ""
          }`}
          to={link}
          style={style}
        >
          {children}
        </Link>
      </RenderIf>
      <RenderIf conditionIs={!link}>
        <div
          aria-label="floating-context-menu-item"
          onClick={(e) => {
            onClick && onClick(e);
            closeContextMenu();
          }}
          className={`${className} cursor-pointer p-2 text-sm text-gray-600 hover:bg-gray-100 active:bg-gray-200 duration-200 ${
            general?.animation ? "duration-200" : ""
          }`}
          style={style}
        >
          {children}
        </div>
      </RenderIf>
    </>
  );
}
