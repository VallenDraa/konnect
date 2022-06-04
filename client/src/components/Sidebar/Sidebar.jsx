import { RiMenu3Line, RiContactsBook2Line } from 'react-icons/ri';
import { BsChatText } from 'react-icons/bs';
import { IoPeopleSharp, IoCall, IoChatbubbles } from 'react-icons/io5';
import { ChatPreview } from '../ChatPreview/ChatPreview';
import { useEffect, useRef } from 'react';

export const Sidebar = ({ chatState, setActiveChat, sidebarState }) => {
  const { chats, setChats } = chatState;
  const { isSidebarOn, setIsSidebarOn } = sidebarState;
  const sidebar = useRef();
  const OPEN =
    'animate-fade-in fixed inset-0 z-20 lg:static lg:basis-1/4 lg:min-w-[350px] bg-gray-50 p-3 shadow-lg lg:shadow-none';
  const CLOSED =
    'animate-slide-left-out fixed inset-0 z-20 transform -translate-x-full lg:-translate-x-0 lg:static lg:basis-1/4 lg:min-w-[350px] bg-gray-50 p-3 shadow-lg lg:shadow-none';

  const handleActiveChat = (target) => {
    const updatedChat = chats.map((chat) => {
      if (chat !== target) {
        return { ...chat, activeChat: false }; //innactive chat
      } else {
        const { username, lastMessage } = chat;
        setActiveChat({ username, lastMessage }); //active chat
        return { ...chat, activeChat: true };
      }
    });

    setChats(updatedChat);
    // close sidebar for smaller screen
    setIsSidebarOn(false);
  };

  // for handling close and open through button press
  useEffect(() => {
    if (!sidebar.current) return;

    if (isSidebarOn) {
      sidebar.current.className = OPEN;
    } else {
      sidebar.current.className = CLOSED;
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
    <aside
      ref={sidebar}
      className="fixed inset-0 z-20 lg:static lg:basis-1/4 lg:min-w-[350px] bg-gray-50 p-3"
    >
      <header className="border-b-2 pb-2 space-y-5">
        {/* profile and more menu */}
        <div className="flex justify-between">
          {/* profile  */}
          <button className="flex items-center gap-1">
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
          {/* more menu */}
          <button
            title="More"
            className="text-lg p-2 hover:text-pink-400 duration-200 rounded-lg"
          >
            <RiMenu3Line />
          </button>
        </div>
        {/* menus */}
        <ul className="flex justify-evenly divide-x-2">
          <li className="cursor-pointer flex flex-col items-center gap-1 text-xxs w-full text-gray-500 hover:text-blue-400 p-1 rounded-lg duration-200">
            <BsChatText className="text-lg" />
            <span>Chats</span>
          </li>
          <li className="cursor-pointer flex flex-col items-center gap-1 text-xxs w-full text-gray-500 hover:text-blue-400 p-1 rounded-lg duration-200">
            <RiContactsBook2Line className="text-lg" />
            <span>Contacts</span>
          </li>
        </ul>
        {/* cta */}
        <div className="flex justify-evenly gap-2">
          <button className="py-1 w-full text-xxs border-2 shadow-sm rounded-full flex items-center gap-1 justify-center hover:bg-slate-200 duration-200">
            <IoCall />
            Start Call
          </button>
          <button className="py-1 w-full text-xxs border-2 shadow-sm rounded-full flex items-center gap-1 justify-center hover:bg-slate-200 duration-200">
            <IoChatbubbles />
            New Chat
          </button>
          <button className="py-1 w-full text-xxs border-2 shadow-sm rounded-full flex items-center gap-1 justify-center hover:bg-slate-200 duration-200">
            <IoPeopleSharp />
            New Group
          </button>
        </div>
      </header>
      <main className="px-1 py-5 max-h-[75vh] overflow-y-auto overflow-x-auto">
        <ul className="space-y-3">
          {chats.map((chat) => (
            <ChatPreview chat={chat} handleActiveChat={handleActiveChat} />
          ))}
        </ul>
      </main>
    </aside>
  );
};
