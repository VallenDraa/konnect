import { useContext, useState } from "react";
import MINI_MODAL_ACTIONS from "../../../context/miniModal/miniModalActions";
import { MiniModalContext } from "../../../context/miniModal/miniModalContext";
import { SettingsContext } from "../../../context/settingsContext/SettingsContext";
import Pill from "../../Buttons/Pill";

export default function NormalConfirmation({ cb, title, caption, payload }) {
  const { miniModalDispatch } = useContext(MiniModalContext);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const [hasBeenPressed, setHasBeenPressed] = useState(false);

  const handleCallback = (e) => {
    e.preventDefault();
    cb(payload);
  };

  return (
    <form
      onSubmit={handleCallback}
      className="flex flex-col grow text-center p-5 h-44"
    >
      <header className="flex flex-col w-full grow-[20] relative">
        <header className="space-y-1">
          <h3 className="font-bold text-base text-gray-800 pt-2">{title}</h3>
          <p className="text-xs text-gray-400">{caption}</p>
        </header>
        <footer className="absolute inset-x-0 top-1/2"></footer>
      </header>
      <footer className="flex w-full gap-x-2 h-10 grow-[1] pt-3 border-t-2">
        <Pill
          disabled={hasBeenPressed}
          onClick={() =>
            miniModalDispatch({ type: MINI_MODAL_ACTIONS.closing })
          }
          className={`h-full text-xs bg-gray-300 disabled:bg-gray-200 text-gray-600 hover:bg-gray-400 hover:text-gray-100 font-bold border-0`}
          type="button"
        >
          No
        </Pill>
        <Pill
          disabled={hasBeenPressed}
          onClick={() => setHasBeenPressed((prev) => !prev)}
          className="h-full text-xs bg-blue-400 disabled:bg-blue-200 hover:bg-blue-300 text-gray-50 hover:text-white hover:shadow-blue-100 active:shadow-blue-100 font-bold border-0"
          type="submit"
        >
          Yes
        </Pill>
      </footer>
    </form>
  );
}
