import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { Menu } from "../Menu/Menu";
import { ModalContext } from "../../context/modal/modalContext";
import { MyProfileModalContent } from "../Modal/Content/MyProfileModalContent/MyProfileModalContent";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/user/userContext";
import ChatList from "../Menu/MenuContents/ChatList/ChatList";
import ContactList from "../Menu/MenuContents/ContactList/ContactList";
import SearchList from "../Menu/MenuContents/SearchList/SearchList";
import MODAL_ACTIONS from "../../context/modal/modalActions";
import CTA from "../CTA/CTA";
import MENUS from "../Menu/MENUS";
import NotificationList from "../Menu/MenuContents/NotificationList/NotificationList";
import _ from "lodash";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  replaceCss,
  SettingsContext,
} from "../../context/settingsContext/SettingsContext";
import { SidebarContext } from "../../pages/Home/Home";
import PP from "../PP/PP";

export const Sidebar = ({ urlHistory }) => {
  const Navigate = useNavigate();
  if (!useContext(SidebarContext)) return;
  const { isSidebarOn, setIsSidebarOn } = useContext(SidebarContext);
  const [activeMenu, setActiveMenu] = useState(MENUS[0].name);
  const { userState } = useContext(UserContext);
  const { modalDispatch } = useContext(ModalContext);
  const sidebar = useRef();
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const { pathname } = useLocation();
  const swiperRef = useRef();
  const isMenuNavigateWithBtn = useRef(false);
  const [sidebarCss, setSidebarCss] = useState({
    OPEN: [`${general?.animation ? "animate-sidebar-in" : "in"}`],
    CLOSED: [
      "transform",
      "translate-y-full",
      "lg:translate-y-0",
      `${general?.animation ? "animate-sidebar-out" : "out"}`,
    ],
    BASE: [
      "inset-0",
      "z-30",
      "fixed",
      "lg:sticky",
      "top-0",
      "h-screen",
      "lg:basis-1/4",
      "lg:min-w-[350px]",
      "bg-gray-100",
      "lg:bg-gray-50",
      "shadow-lg",
      "lg:shadow-none",
    ],
  });
  const closeSidebar = useCallback(
    _.throttle(() => {
      if (window.innerWidth >= 1024) isSidebarOn && setIsSidebarOn(false);
    }, 500),
    [isSidebarOn]
  );
  const checkIfNavigateWithBtn = useCallback(
    _.throttle(() => {
      if (isMenuNavigateWithBtn.current) {
        isMenuNavigateWithBtn.current = false;
      }
    }, 800),
    [isMenuNavigateWithBtn]
  );

  useEffect(() => {
    if (isMenuNavigateWithBtn) {
      if (pathname.includes("/chats") || pathname === "/") {
        swiperRef.current.slideTo(0);
      } else if (pathname.includes("/contacts")) {
        swiperRef.current.slideTo(1);
      } else if (pathname.includes("/search")) {
        swiperRef.current.slideTo(2);
      } else if (pathname.includes("/notifications")) {
        swiperRef.current.slideTo(3);
      }
    }
  }, [pathname]);

  // for handling close and open through button press
  useEffect(() => {
    if (!sidebar.current) return;

    if (isSidebarOn) {
      sidebar.current.className = `${sidebarCss.OPEN.join(
        " "
      )} ${sidebarCss.BASE.join(" ")}`;
    } else {
      sidebar.current.className = `${sidebarCss.CLOSED.join(
        " "
      )} ${sidebarCss.BASE.join(" ")}`;

      // remove slide out animation if window size is larger than 1024
      if (window.innerWidth >= 1024) {
        sidebar.current.classList.remove("animate-sidebar-out");
      }
    }
  }, [isSidebarOn]);

  // for handling animation setting when it's active and disabled
  useEffect(() => {
    setSidebarCss((prev) => ({
      BASE: prev.BASE,
      CLOSED: replaceCss(
        prev.CLOSED,
        general?.animation ? "animate-sidebar-out" : "out"
      ),
      OPEN: replaceCss(
        prev.OPEN,
        general?.animation ? "animate-sidebar-in" : "in"
      ),
    }));
  }, [general]);

  // for handling close and open through screen size
  useEffect(() => {
    window.addEventListener("resize", closeSidebar);

    return () => window.removeEventListener("resize", closeSidebar);
  }, [setIsSidebarOn, isSidebarOn]);

  // when swiper active index change
  const navigateMenu = (i) => {
    if (!isMenuNavigateWithBtn.current) {
      switch (i) {
        case 0:
          Navigate("/chats");
          break;
        case 1:
          Navigate("/contacts");
          break;
        case 2:
          Navigate("/search");
          break;
        case 3:
          Navigate("/notifications?box=inbox");
          break;
        default:
          Navigate("/chats");
          break;
      }
    }
  };

  return (
    <aside ref={sidebar}>
      <div className="min-h-full flex flex-col bg-white max-w-screen-sm mx-auto">
        <header className="space-y-5 basis-1/6 p-3 border-b-2 border-slate-200">
          {/* profile and more menu */}
          <div className="flex justify-between items-center gap-2">
            {/* profile  */}
            <Link
              to={`user/${userState.user.username}`}
              onClick={() =>
                modalDispatch({
                  type: MODAL_ACTIONS.show,
                  prevUrl: urlHistory.prev,
                  onExitReturnToHome: false,
                  content: <MyProfileModalContent />,
                })
              }
              className={`flex items-center gap-1 shadow hover:shadow-md bg-gray-200 hover:bg-gray-300 p-2 rounded-lg grow w-2/3 ${
                general?.animation ? "duration-200" : ""
              }`}
            >
              <PP
                type="private"
                src={userState.user.profilePicture || null}
                alt={userState.user.username}
                className="rounded-full w-9 h-9"
              />
              <div className="flex flex-col items-start overflow-hidden">
                <span className="text-sm truncate">
                  {userState.user.username}
                </span>
                <span className="text-xs text-gray-500 relative z-10 truncate">
                  {userState.user.status || "-"}
                </span>
              </div>
            </Link>
          </div>
          {/* menus */}
          <Menu
            isMenuNavigateWithBtn={isMenuNavigateWithBtn}
            urlHistory={urlHistory}
            menus={MENUS}
            activeMenuState={{ activeMenu, setActiveMenu }}
          />
        </header>
        {/* menu contents */}
        <main className="grow overflow-y-auto overflow-x-auto relative">
          {/* cta */}
          <section
            className="lg:hidden absolute z-30 bottom-5 inset-x-5"
            aria-label="action-buttons"
          >
            <CTA enableSlide={true} urlHistory={urlHistory} />
          </section>

          {/* the content */}
          <Swiper
            onTouchMove={checkIfNavigateWithBtn}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            noSwiping={!settings?.general?.menuSwiping}
            noSwipingClass="no-swipe"
            spaceBetween={0}
            slidesPerView={"auto"}
            className={`absolute inset-0 
                    ${settings?.general?.menuSwiping ? "cursor-grab" : ""}`}
            onActiveIndexChange={({ activeIndex }) => navigateMenu(activeIndex)}
          >
            <SwiperSlide className="no-swipe relative">
              <ChatList
                contacts={userState.user.contacts}
                setIsSidebarOn={setIsSidebarOn}
              />
            </SwiperSlide>
            <SwiperSlide className="no-swipe overflow-y-auto">
              <ContactList setIsSidebarOn={setIsSidebarOn} />
            </SwiperSlide>
            <SwiperSlide className="no-swipe">
              <SearchList />
            </SwiperSlide>
            <SwiperSlide className="no-swipe">
              <NotificationList />
            </SwiperSlide>
          </Swiper>
        </main>
      </div>
    </aside>
  );
};
