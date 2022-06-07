import { useState, useEffect, useRef, useContext } from 'react';
import { BsChatText } from 'react-icons/bs';
import { RiContactsBook2Line } from 'react-icons/ri';
import { ChatList } from '../ChatList/ChatList';
import { ContactList } from '../ContactList/ContactList';
import { Menu } from '../Menu/Menu';
import { ModalContext } from '../../context/Modal/modalContext';
import MODAL_ACTIONS from '../../context/Modal/modalActions';
import CTA from '../CTA/CTA';
import { ProfileModalContent } from '../Modal/Content/ProfileModalContent/ProfileModalContent';

export const Sidebar = ({ setActiveChat, sidebarState }) => {
  const MENUS = [
    { name: 'Chats', icon: BsChatText },
    { name: 'Contacts', icon: RiContactsBook2Line },
  ];
  const SIDEBAR_APPEARANCE = {
    OPEN: 'animate-sidebar-in inset-0 z-20 fixed lg:sticky top-0 h-screen lg:basis-1/4 lg:min-w-[350px] bg-gray-50 p-3 shadow-lg lg:shadow-none flex flex-col',
    CLOSED:
      'animate-sidebar-out transform translate-y-full lg:translate-y-0 inset-0 z-20 fixed lg:sticky top-0 h-screen lg:basis-1/4 lg:min-w-[350px] bg-gray-50 p-3 shadow-lg lg:shadow-none flex flex-col',
  };

  const { isSidebarOn, setIsSidebarOn } = sidebarState;
  const [activeMenu, setActiveMenu] = useState(MENUS[0].name);
  const { modalDispatch } = useContext(ModalContext);
  const sidebar = useRef();

  // for handling close and open through button press
  useEffect(() => {
    if (!sidebar.current) return;

    if (isSidebarOn) {
      sidebar.current.className = SIDEBAR_APPEARANCE.OPEN;

      // disable body scrolling if window size is less than 1024
      if (window.innerWidth <= 1024) {
        document.body.style.overflowY = 'hidden';
      }
    } else {
      sidebar.current.className = SIDEBAR_APPEARANCE.CLOSED;
      document.body.style.overflowY = 'auto';

      // remove slide out animation if window size is larger than 1024
      if (window.innerWidth >= 1024) {
        sidebar.current.classList.remove('animate-sidebar-out');
      }
    }
  }, [isSidebarOn]);

  // for handling close and open through screen size
  useEffect(() => {
    const closeSidebar = () => {
      if (window.innerWidth >= 1024) {
        isSidebarOn && setIsSidebarOn(false);
      }
    };

    window.addEventListener('resize', () => closeSidebar());

    return () => window.removeEventListener('resize', () => closeSidebar());
  }, [setIsSidebarOn, isSidebarOn]);

  return (
    <aside ref={sidebar}>
      <header className="border-b-2 pb-2 space-y-5 basis-1/6 ">
        {/* profile and more menu */}
        <div className="flex justify-between">
          {/* profile  */}
          <button
            onClick={() =>
              modalDispatch({
                type: MODAL_ACTIONS.show,
                content: <ProfileModalContent />,
              })
            }
            className="flex items-center gap-1 hover:bg-gray-200 w-full p-2 duration-200"
          >
            <img
              src="https://picsum.photos/200/200"
              alt=""
              className="rounded-full h-8 w-8"
            />
            <div className="flex flex-col items-start">
              <span className="text-xs max-w-[200px] truncate">VallenDra</span>
              <span className="text-xxs text-gray-500 relative z-10 max-w-[200px] truncate">
                Status
              </span>
            </div>
          </button>
        </div>
        {/* menus */}
        <Menu menus={MENUS} activeMenuState={{ activeMenu, setActiveMenu }} />
        {/* cta */}
        <CTA />
      </header>
      <main className="px-1 basis-5/6 overflow-y-auto overflow-x-auto">
        {activeMenu === 'Chats' && (
          <ChatList
            setActiveChat={setActiveChat}
            setIsSidebarOn={setIsSidebarOn}
          />
        )}
        {activeMenu === 'Contacts' && (
          <ContactList
            setActiveChat={setActiveChat}
            setIsSidebarOn={setIsSidebarOn}
          />
        )}
      </main>
    </aside>
  );
};
