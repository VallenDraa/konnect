import { useContext, useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SettingsContext } from "../../../context/settingsContext/SettingsContext";
import RenderIf from "../../../utils/React/RenderIf";
import checkInjectedClasses from "../../../utils/tailwindClasses/checkInjectedClasses";

export default function DropdownItem({
  children,
  className = "",
  isActive,
  onClick,
  to,
  style,
}) {
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  const [defaultClasses, setDefaultClasses] = useState(`
  cursor-pointer rounded 
  ${!to ? "w-full flex items-center gap-x-1" : ""}
  ${isActive ? "bg-gray-200" : "active:bg-gray-200"}
  ${isActive ? "shadow" : "hover:shadow-sm"}
  ${isActive ? "text-blue-400" : "text-gray-400"}
  ${isActive ? "font-semibold" : ""}
  ${isActive ? "" : "hover:bg-gray-100"}
  ${general?.animation ? "duration-200" : ""}
  `);

  useEffect(() => {
    className = checkInjectedClasses({
      injectedClasses: className,
      defClassGetter: defaultClasses,
      defClassSetter: setDefaultClasses,
    });
  }, []);

  useEffect(() => {
    setDefaultClasses((prev) =>
      prev.replace(
        general?.animation ? "" : "duration-200",
        general?.animation ? "duration-200" : ""
      )
    );
  }, [general]);

  return (
    <li onClick={onClick}>
      <RenderIf conditionIs={!to}>
        <button style={style} className={`${className} ${defaultClasses}`}>
          <span className="w-full px-2 py-3 flex items-center gap-x-1">
            {children}
          </span>
        </button>
      </RenderIf>
      <RenderIf conditionIs={to}>
        <Link
          to={to}
          style={style}
          className={`${className} ${defaultClasses}`}
        >
          <span className="w-full px-2 py-3 flex items-center gap-x-1">
            {children}
          </span>
        </Link>
      </RenderIf>
    </li>
  );
}
