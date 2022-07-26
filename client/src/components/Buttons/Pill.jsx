import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  replaceCss,
  SettingsContext,
} from "../../context/settingsContext/SettingsContext";
import RenderIf from "../../utils/React/RenderIf";

export default function Pill({
  className,
  children,
  onClick,
  style,
  type = "button",
  disabled = false,
  link,
}) {
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const [defaultClasses, setDefaultClasses] = useState([
    "py-2",
    "px-3",
    "w-full",
    "shadow-md",
    "hover:shadow-lg",
    "active:shadow-md",
    "rounded-full",
    "flex",
    "items-center",
    "gap-1",
    "justify-center",
    "text-xs",
    `${general?.animation ? "duration-200" : ""}`,
  ]);

  useEffect(() => {
    if (general?.animation) {
      setDefaultClasses((prev) =>
        replaceCss(prev, general?.animation ? "duration-200" : "")
      );
    }
  }, [general]);

  return (
    <>
      <RenderIf conditionIs={!link}>
        <button
          disabled={disabled}
          type={type}
          style={style}
          onClick={() => {
            if (typeof onClick === "function") !disabled && onClick();
          }}
          className={`${defaultClasses.join(" ")} ${className}`}
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
            if (typeof onClick === "function") !disabled && onClick();
          }}
          className={`${defaultClasses.join(" ")} ${className}`}
        >
          {children}
        </Link>
      </RenderIf>
    </>
  );
}
