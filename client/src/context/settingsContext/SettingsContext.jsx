import { useContext, useEffect, useRef, useState } from "react";
import { createContext } from "react";
import api from "../../utils/apiAxios/apiAxios";
import { UserContext } from "../user/userContext";

export const SETTINGS_DEFAULT = {
  calls: {},
  general: {},
  messages: {},
};

export const SettingsContext = createContext(SETTINGS_DEFAULT);

export default function SettingsContextProvider({ children }) {
  const hasFetched = useRef(false);
  const [settings, setSettings] = useState(SETTINGS_DEFAULT);
  const { userState } = useContext(UserContext);

  useEffect(() => {
    if (userState.user && !hasFetched.current) {
      const getSettings = async () => {
        try {
          const { data } = await api.get("/user/get_settings", {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          });

          setSettings(data.settings || SETTINGS_DEFAULT);
          hasFetched.current = true;
        } catch (error) {
          console.error(error);
        }
      };

      getSettings();
    }
  }, [userState]);

  // useEffect(() => console.log(settings), [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const updateSettings = async ({ newSettings, type, setSettings }) => {
  const payload = { type, settings: newSettings };

  try {
    await api.put("/user/edit_settings", payload, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
    });

    setSettings((oldSettings) => ({
      ...oldSettings,
      [type]: newSettings,
    }));
  } catch (error) {
    throw error;
  }
};

export const replaceCss = (classList, replacement) => {
  if (!classList) return;
  return classList.map((item, i) => {
    if (i !== classList.length - 1) {
      return item;
    } else {
      return replacement;
    }
  });
};
