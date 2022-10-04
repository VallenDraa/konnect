import { useContext } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { SettingsContext } from "../../context/settingsContext/SettingsContext";

export default function LoadingSpinner() {
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  return (
    <div
      className={`${
        general?.animation ? "animate-fade-in" : ""
      } mx-auto flex flex-col items-center text-gray-500 gap-2`}
    >
      <AiOutlineLoading3Quarters className="animate-spin text-lg" />
      <span className="animate-pulse">
        <span className="text-xl font-semibold">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-600 to-blue-400">
            Konn
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-pink-400 to-pink-600">
            ecting
          </span>
        </span>
      </span>
    </div>
  );
}
