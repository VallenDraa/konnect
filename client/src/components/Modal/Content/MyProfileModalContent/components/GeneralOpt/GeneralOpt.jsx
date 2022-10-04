import {
  IoInvertModeSharp,
  IoSparklesSharp,
  IoAccessibilitySharp,
  IoLanguageSharp,
  IoSpeedometerSharp,
} from "react-icons/io5";
import { BsFillSunFill, BsFillMoonFill } from "react-icons/bs";
import SwitchBtn from "../../../../../Buttons/SwitchBtn";
import { UserContext } from "../../../../../../context/user/userContext";
import { useContext, useRef, useState } from "react";
import { useEffect } from "react";
import Language, { LANGUAGES } from "./components/Languange/Language";
import {
  SettingsContext,
  updateSettings,
} from "../../../../../../context/settingsContext/SettingsContext";
import { MdOutlineAnimation, MdSwipe } from "react-icons/md";

const GeneralOpt = () => {
  const { userState, userDispatch } = useContext(UserContext);
  const { settings, setSettings } = useContext(SettingsContext);
  const { general } = settings;
  const newGeneral = useRef({});
  const [language, setLanguage] = useState(general.language || LANGUAGES[0]);
  const [theme, setTheme] = useState(general.theme || "light");
  const [menuSwiping, setMenuSwiping] = useState(general.menuSwiping || false);
  const [animation, setAnimation] = useState(general.animation || false);

  // for updating user settings in the database
  useEffect(() => {
    return async () => {
      // check if the new user settings are the same with the old one, if so don't execute the code below
      const isAllOptsSame = Object.keys(newGeneral.current).every(
        (key) => general[key] === newGeneral.current[key]
      );

      if (!isAllOptsSame) {
        updateSettings({
          newSettings: newGeneral.current,
          type: "general",
          setSettings,
        });
      }
    };
  }, []);

  useEffect(() => {
    newGeneral.current.theme = theme;
  }, [theme]);
  useEffect(() => {
    newGeneral.current.language = language;
  }, [language]);
  useEffect(() => {
    newGeneral.current.menuSwiping = menuSwiping;
  }, [menuSwiping]);
  useEffect(() => {
    newGeneral.current.animation = animation;
  }, [animation]);

  return (
    <ul className="space-y-10 p-5 lg:p-3">
      {/* appearance options */}
      <li className="border-b-2">
        <h2 className="font-semibold flex items-center gap-2 text-gray-500 text-xs mb-2">
          <IoSparklesSharp />
          Appearance
        </h2>
        <ul className=" w-full overflow-y-hidden flex flex-col gap-0.5">
          {/* theme */}
          <li
            className={`flex items-center justify-between w-full hover:bg-gray-100 p-3 ${
              general?.animation ? "duration-200" : ""
            }`}
          >
            <span className="flex items-center gap-2 font-semibold text-sm">
              <IoInvertModeSharp />
              Theme (WIP)
            </span>
            <SwitchBtn
              on={theme === "dark" && true}
              onClick={(isLight) => setTheme(isLight ? "light" : "dark")}
              icon1={<BsFillSunFill className="text-sm" />}
              icon2={<BsFillMoonFill className="text-sm" />}
            />
          </li>
        </ul>
      </li>

      {/* accessibility options*/}
      <li className="border-b-2 relative">
        <h2 className="font-semibold flex items-center gap-2 text-gray-500 text-xs mb-2">
          <IoAccessibilitySharp />
          Accessibility
        </h2>
        <ul className=" w-full overflow-y-hidden flex flex-col gap-0.5">
          {/* language */}
          {/* <li
            className={`overflow-auto flex items-center justify-between w-full hover:bg-gray-100 p-3 ${
              general?.animation ? "duration-200" : ""
            }`}
          >
            <span className="flex items-center gap-2 font-semibold text-sm">
              <IoLanguageSharp />
              Language
            </span>
            <div className="absolute right-3">
              <Language languageState={{ language, setLanguage }} />
            </div>
          </li> */}
          {/* swipeable menu */}
          <li
            className={`flex items-center justify-between w-full hover:bg-gray-100 p-3 ${
              general?.animation ? "duration-200" : ""
            }`}
          >
            <span className="flex items-center gap-2 font-semibold text-sm">
              <MdSwipe />
              Menu Swiping
            </span>
            <SwitchBtn
              on={menuSwiping}
              onClick={() => setMenuSwiping(!menuSwiping)}
              icon1={
                <span className="text-xs font-semibold flex items-center">
                  off
                </span>
              }
              icon2={
                <span className="text-xs font-semibold flex items-center">
                  on
                </span>
              }
            />
          </li>
        </ul>
      </li>

      {/* performance options*/}
      <li className="border-b-2 relative">
        <h2 className="font-semibold flex items-center gap-2 text-gray-500 text-xs mb-2">
          <IoSpeedometerSharp />
          Performance
        </h2>
        <ul className=" w-full overflow-y-hidden flex flex-col gap-0.5">
          {/* Animation */}
          <li
            className={`flex items-center justify-between w-full hover:bg-gray-100 p-3 ${
              general?.animation ? "duration-200" : ""
            }`}
          >
            <span className="flex items-center gap-2 font-semibold text-sm">
              <MdOutlineAnimation />
              Animation
            </span>
            <SwitchBtn
              on={animation}
              onClick={() => setAnimation(!animation)}
              icon1={
                <span className="text-xs font-semibold flex items-center">
                  off
                </span>
              }
              icon2={
                <span className="text-xs font-semibold flex items-center">
                  on
                </span>
              }
            />
          </li>
        </ul>
      </li>
    </ul>
  );
};

export default GeneralOpt;
