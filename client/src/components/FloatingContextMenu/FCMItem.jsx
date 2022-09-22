import { useContext } from "react";
import { Link } from "react-router-dom";
import { SettingsContext } from "../../context/settingsContext/SettingsContext";
import RenderIf from "../../utils/React/RenderIf";

export default function FCMItem({ children, onClick, link = null }) {
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  return (
    <li
      onClick={onClick}
      className={`cursor-pointer p-3 text-sm hover:bg-gray-100 active:bg-gray-200 duration-200 ${
        general?.animation ? "duration-200" : ""
      }
      `}
    >
      <RenderIf conditionIs={link}>
        <Link to={link}>{children}</Link>
      </RenderIf>
      <RenderIf conditionIs={!link}>{children}</RenderIf>
    </li>
  );
}
