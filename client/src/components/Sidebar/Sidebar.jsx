import { useState, useEffect, useRef, useContext } from 'react';
import { Menu } from '../Menu/Menu';
import { ModalContext } from '../../context/modal/modalContext';
import { MyProfileModalContent } from '../Modal/Content/MyProfileModalContent/MyProfileModalContent';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/user/userContext';
import ChatList from '../Menu/MenuContents/ChatList/ChatList';
import ContactList from '../Menu/MenuContents/ContactList/ContactList';
import SearchList from '../Menu/MenuContents/SearchList/SearchList';
import MODAL_ACTIONS from '../../context/modal/modalActions';
import CTA from '../CTA/CTA';
import MENUS from '../Menu/MENUS';
import SIDEBAR_APPEARANCE from './SidebarAppearance/SidebarAppearance';
import NotificationList from '../Menu/MenuContents/NotificationList/NotificationList';
import throttle from '../../utils/performance/throttle';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import { SettingsContext } from '../../context/settingsContext/SettingsContext';

export const Sidebar = ({ sidebarState, urlHistory }) => {
  const Navigate = useNavigate();
  const { isSidebarOn, setIsSidebarOn } = sidebarState;
  const [activeMenu, setActiveMenu] = useState(MENUS[0].name);
  const { userState, userDispatch } = useContext(UserContext);
  const { modalState, modalDispatch } = useContext(ModalContext);
  const sidebar = useRef();
  const { settings, setSettings } = useContext(SettingsContext);
  const { pathname } = useLocation();
  const swiperRef = useRef();

  useEffect(() => {
    if (pathname.includes('/chats')) {
      swiperRef.current.slideTo(0);
    } else if (pathname.includes('/contacts')) {
      swiperRef.current.slideTo(1);
    } else if (pathname.includes('/search')) {
      swiperRef.current.slideTo(2);
    } else if (pathname.includes('/notifications')) {
      swiperRef.current.slideTo(3);
    }
  }, [pathname]);

  // for handling close and open through button press
  useEffect(() => {
    if (!sidebar.current) return;

    if (isSidebarOn) {
      sidebar.current.className = SIDEBAR_APPEARANCE.OPEN;
    } else {
      sidebar.current.className = SIDEBAR_APPEARANCE.CLOSED;

      // remove slide out animation if window size is larger than 1024
      if (window.innerWidth >= 1024) {
        sidebar.current.classList.remove('animate-sidebar-out');
      }
    }
  }, [isSidebarOn]);

  // for handling close and open through screen size
  useEffect(() => {
    const closeSidebar = throttle(() => {
      if (window.innerWidth >= 1024) isSidebarOn && setIsSidebarOn(false);
    }, 200);

    window.addEventListener('resize', closeSidebar);

    return () => window.removeEventListener('resize', closeSidebar);
  }, [setIsSidebarOn, isSidebarOn]);

  // when swiper active index change
  const navigateMenu = (i) => {
    switch (i) {
      case 0:
        return Navigate('/chats');
      case 1:
        return Navigate('/contacts');
      case 2:
        return Navigate('/search');
      case 3:
        return Navigate('/notifications?box=inbox');
      default:
        return Navigate('/chats');
    }
  };

  return (
    <aside ref={sidebar}>
      <header className="space-y-5 basis-1/6 p-3 border-b-4 border-slate-200">
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
            className="flex items-center gap-1 shadow hover:shadow-md bg-gray-200 hover:bg-gray-300 p-2 duration-200 rounded-lg grow w-2/3"
          >
            <img
              src="https://picsum.photos/200/200"
              alt=""
              className="rounded-full h-8 w-8"
            />
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-sm truncate">
                {userState.user.username}
              </span>
              <span className="text-xs text-gray-500 relative z-10 truncate">
                {userState.user.status || 'unset'}
              </span>
            </div>
          </Link>
        </div>
        {/* menus */}
        <Menu
          urlHistory={urlHistory}
          menus={MENUS}
          activeMenuState={{ activeMenu, setActiveMenu }}
        />
        {/* cta */}
        <section className="lg:hidden" aria-label="action-buttons">
          <CTA enableSlide={true} urlHistory={urlHistory} />
        </section>
      </header>
      {/* menu contents */}
      <main className="basis-5/6 overflow-y-auto overflow-x-auto relative">
        <Swiper
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          noSwiping={!settings.general.menuSwiping}
          noSwipingClass="no-swipe"
          spaceBetween={0}
          slidesPerView={'auto'}
          className={`absolute inset-0 
                    ${settings.general.menuSwiping ? 'cursor-grab' : ''}`}
          onActiveIndexChange={({ activeIndex }) => navigateMenu(activeIndex)}
        >
          <SwiperSlide className="no-swipe">
            <ChatList
              contacts={userState.user.contacts}
              setIsSidebarOn={setIsSidebarOn}
            />
          </SwiperSlide>
          <SwiperSlide className="no-swipe">
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
    </aside>
  );
};
