import {
  IoInvertModeSharp,
  IoSparklesSharp,
  IoAccessibilitySharp,
  IoLanguageSharp,
} from "react-icons/io5";
import { BsFillSunFill, BsFillMoonFill } from "react-icons/bs";
import SwitchBtn from "../../../../../Buttons/SwitchBtn";
import { UserContext } from "../../../../../../context/user/userContext";
import { useContext, useState } from "react";
import { useEffect } from "react";
import Language, { LANGUAGES } from "./components/Languange/Language";
import api from "../../../../../../utils/apiAxios/apiAxios";
import USER_ACTIONS from "../../../../../../context/User/userAction";

const GeneralOpt = () => {
  const { userState, userDispatch } = useContext(UserContext);
  const { general } = userState.user.settings;
  const [language, setLanguage] = useState(general.language || LANGUAGES[0]);
  const [theme, setTheme] = useState(general.theme || "light");

  // for updating user settings in the database
  useEffect(() => {
    return async () => {
      // assemble the settings object
      const opts = { language, theme };

      // check if the new user settings are the same with the old one, if so don't execute the code below
      const isAllOptsSame = Object.keys(opts).every(
        (key) => general[key] === opts[key]
      );
      if (isAllOptsSame) return;

      const payload = {
        token: sessionStorage.getItem("token"),
        type: "general",
        settings: opts,
      };

      try {
        const { data } = await api.put("/user/edit_settings", payload);
        if (data.success) {
          sessionStorage.setItem("token", data.token);
          userDispatch({
            type: USER_ACTIONS.updateSuccess,
            payload: data.user,
          });
        } else {
          userDispatch({
            type: USER_ACTIONS.updateFail,
            payload: data.message,
          });
        }
      } catch (error) {
        userDispatch({ type: USER_ACTIONS.updateFail, payload: error });
        console.log(error);
      }
    };
  }, [language, theme]);

  // const handleOptChange = (opt, value) => {
  //   setOpts((prev) => {
  //     prev[opt] = value;
  //     return { ...prev };
  //   });
  // };

  return (
    <ul className="space-y-10 p-3">
      {/* appearance options */}
      <li className="border-b-2">
        <h2 className="font-semibold flex items-center gap-2 text-gray-500 text-xs mb-2">
          <IoSparklesSharp />
          Appearance
        </h2>
        <ul className=" w-full overflow-y-hidden flex flex-col divide-y-2">
          {/* theme */}
          <li className="flex items-center justify-between w-full hover:bg-gray-100 p-3 duration-200">
            <span className="flex items-center gap-2 font-semibold text-sm">
              <IoInvertModeSharp />
              Theme
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
      <li className="border-b-2">
        <h2 className="font-semibold flex items-center gap-2 text-gray-500 text-xs mb-2">
          <IoAccessibilitySharp />
          Accessibility
        </h2>
        <ul className=" w-full overflow-y-hidden flex flex-col divide-y-2">
          {/* theme */}
          <li className="flex items-center justify-between w-full hover:bg-gray-100 p-3 duration-200">
            <span className="flex items-center gap-2 font-semibold text-sm">
              <IoLanguageSharp />
              Language
            </span>
            <Language languageState={{ language, setLanguage }} />
          </li>
        </ul>
      </li>
    </ul>
  );
};

export default GeneralOpt;
