import { HiOutlineMenu } from "react-icons/hi";
import CTA from "../CTA/CTA";
import { Logo } from "../Logo/Logo";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { SettingsContext } from "../../context/settingsContext/SettingsContext";
import { SidebarContext } from "../../pages/Home/Home";

export const StartScreen = () => {
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const { setIsSidebarOn } = useContext(SidebarContext);

  return (
    <main className="basis-full lg:basis-3/4 shadow-inner bg-gray-100 relative h-screen flex flex-col gap-3 items-center justify-center px-5">
      <header className="bg-gray-50 absolute inset-x-0 z-10 shadow-inner py-2 px-5 border-b-2 top-0">
        <div className="flex flex-wrap justify-between items-center gap-2 max-w-screen-sm lg:max-w-full mx-auto">
          <div className="flex justify-between items-center grow sm:flex-grow-0 gap-3">
            {/* sidebar btn (will show up when screen is <lg) */}
            <button
              onClick={() => setIsSidebarOn(true)}
              className={`block lg:hidden hover:text-blue-400 text-2xl
                        ${general?.animation ? "duration-200" : ""}`}
            >
              <HiOutlineMenu />
            </button>
            <Link to="/chats" className="relative bottom-[1px] ">
              <Logo />
            </Link>
          </div>

          <CTA className="flex justify-evenly gap-2 basis-full sm:basis-96" />
        </div>
      </header>
    </main>
  );
};
