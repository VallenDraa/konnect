import { useContext, useState } from "react";
import { useEffect } from "react";
import { SettingsContext } from "../../../../context/settingsContext/SettingsContext";
import throttle from "../../../../utils/performance/throttle";
import RenderIf from "../../../../utils/React/RenderIf";
import LogoutBtn from "../../../Buttons/LogoutBtn";
import Dropdown from "../../../Dropdown/Dropdown";
import DropdownItem from "../../../Dropdown/DropdownItem/DropdownItem";

export default function SettingsMenu({ options, activeOptState }) {
  const { activeOpt, setActiveOpt } = activeOptState;
  const [Icon, setIcon] = useState(null);
  const [isOnTop, setIsOnTop] = useState(window.innerWidth <= 1024);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  //   check if the settings menu would be on top of the screen or the side
  useEffect(() => {
    const moveMenuToTop = throttle(() => {
      setIsOnTop(window.innerWidth <= 1024);
    }, 60);

    window.addEventListener("resize", moveMenuToTop);

    return () => window.removeEventListener("resize", moveMenuToTop);
  }, []);

  useEffect(() => {
    const { icon } = options.find(({ name }) => name === activeOpt);
    setIcon(icon);
  }, [activeOpt]);

  return (
    <aside className="bg-gray-100 basis-auto lg:basis-1/3 sticky top-0 lg:static z-30">
      <ul>
        <RenderIf conditionIs={!isOnTop}>
          {options.map((opt, i) => {
            return (
              <li key={i} onClick={() => setActiveOpt(opt.name)}>
                <button
                  className={`
                  ${general?.animation ? "duration-200" : ""}
                  ${
                    opt.name === activeOpt
                      ? "bg-white text-gray-800 font-semibold"
                      : "hover:bg-gray-200 text-gray-500 hover:text-gray-600 font-medium"
                  } cursor-pointer p-2 capitalize flex items-center gap-2 h-9 w-full`}
                >
                  <span className="text-base">{opt.icon}</span>
                  <span>{opt.name}</span>
                </button>
              </li>
            );
          })}
          {/* logout button */}
          <li className="w-5/6 mx-auto mt-4">
            <LogoutBtn />
          </li>
        </RenderIf>
        <RenderIf conditionIs={isOnTop}>
          <Dropdown
            // fontSize={14}
            icon={Icon}
            text={activeOpt}
            position={"origin-top"}
            className="border-y-2 bg-gray-200 hover:bg-gray-100 duration-200 text-black"
            btnClassName="border-0 shadow-none w-full flex justify-center py-1 text-lg rounded-none"
            listStyle={{ width: "100%", borderRadius: "0px" }}
            listClassName="shadow-xl"
          >
            {options.map((opt) => (
              <DropdownItem
                key={opt.name}
                onClick={() => setActiveOpt(opt.name)}
                isActive={opt.name === activeOpt}
                className="flex justify-center items-center"
              >
                <span className="capitalize flex items-center gap-x-2 text-base">
                  {opt.icon}
                  {opt.name}
                </span>
              </DropdownItem>
            ))}
            <li className="w-full sm:w-3/4 lg:w-2/3 mx-auto my-3">
              <LogoutBtn />
            </li>
          </Dropdown>
        </RenderIf>
      </ul>
    </aside>
  );
}
