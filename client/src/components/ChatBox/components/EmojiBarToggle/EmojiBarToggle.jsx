import { useContext } from "react";
import { useEffect } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { SettingsContext } from "../../../../context/settingsContext/SettingsContext";

export default function EmojiBarToggle({ isEmojiBarOnState }) {
  const { isEmojiBarOn, setIsEmojiBarOn } = isEmojiBarOnState;
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  useEffect(() => {
    const hideOnClickOutside = (e) => {
      if (typeof e.target.className === "object") return;

      if (e.target.className.includes("emoji") === false) {
        if (isEmojiBarOn) setIsEmojiBarOn(false);
      }
    };

    window.addEventListener("click", hideOnClickOutside);

    return () => window.removeEventListener("click", hideOnClickOutside);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setIsEmojiBarOn(!isEmojiBarOn)}
      className={`text-xl disabled:cursor-not-allowed disabled:text-gray-500 text-gray-700
                ${
                  general?.animation
                    ? "disabled:animate-pulse duration-200"
                    : ""
                }
      `}
    >
      <BsEmojiSmile />
    </button>
  );
}
