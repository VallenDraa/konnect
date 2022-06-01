import { RiMenu3Line, RiContactsBook2Line } from 'react-icons/ri';
import { BsChatText } from 'react-icons/bs';
import { IoPeopleSharp, IoCall, IoChatbubbles } from 'react-icons/io5';
import { FaPaperPlane } from 'react-icons/fa';
import { useState } from 'react';
import { ChatPreview } from '../../components/ChatPreview/ChatPreview';

export const Home = () => {
  const [chats, setChats] = useState([
    {
      username: 'john',
      id: '1',
      lastMessage: {
        type: 'text',
        content: 'Lorem ipsum dolor sit',
      },
      activeChat: false,
    },
    {
      username: 'steve',
      id: '2',
      lastMessage: {
        type: 'call',
        content: 'Call Lasted For 4:20:00',
      },
      activeChat: false,
    },
    {
      username: 'jake',
      id: '3',
      lastMessage: {
        type: 'image',
        content: 'Image',
      },
      activeChat: false,
    },
    {
      username: 'david',
      id: '4',
      lastMessage: {
        type: 'video',
        content: 'Video',
      },
      activeChat: false,
    },
  ]);

  const handleActiveChat = (target) => {
    const updatedChat = chats.map((chat) => {
      if (chat !== target) {
        return { ...chat, activeChat: false };
      } else {
        return { ...chat, activeChat: true };
      }
    });

    setChats(updatedChat);
  };

  return (
    <div className="min-h-screen flex">
      <aside className="basis-1/4 md:min-w-[350px] bg-gray-50 p-3">
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
                <span className="text-xs max-w-[200px] truncate">
                  VallenDra
                </span>
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
      <main className="basis-3/4 shadow-inner bg-gray-100 h-screen relative">
        <header className="h-12 bg-black absolute inset-x-0 z-10"></header>
        <main className="h-full max-w-screen-xl bg-blue-100 w-full mx-auto max-w-screen relative">
          <form className="bg-gray-100 absolute bottom-0 inset-x-0 h-12 flex items-center justify-center gap-3 py-2">
            <input
              type="text"
              className="bg-white basis-11/12 h-full rounded-full px-3"
            />
            <button className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center">
              <FaPaperPlane className="relative right-[1px]" />
            </button>
          </form>
        </main>
      </main>
    </div>
  );
};
