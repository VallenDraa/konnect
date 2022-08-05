import { useContext } from "react";
import { SettingsContext } from "../../../../../context/settingsContext/SettingsContext";

export default function NotifListItem({ children }) {
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  return (
    <li
      className={`rounded-lg text-slate-500 min-h-[80px] flex items-center border-b-2 ${
        general.animation ? "animate-d-down-open" : ""
      }`}
    >
      {children}
    </li>
  );
}
