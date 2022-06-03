import noActiveChat from '../../svg/home/noActiveChat.svg';
import { HiOutlineMenu } from 'react-icons/hi';
import { IoPeopleSharp, IoCall, IoChatbubbles } from 'react-icons/io5';

export const StartScreen = ({ sidebarState }) => {
  const { sidebarOn, setSidebarOn } = sidebarState;

  return (
    <main className="basis-full lg:basis-3/4 shadow-inner bg-gray-100 relative h-screen flex flex-col gap-3 items-center justify-center tracking-wide px-5">
      <header className="bg-gray-50 absolute inset-x-0 z-10 shadow-inner p-3 border-b-2 top-0">
        <div className="flex justify-between lg:justify-center items-center">
          <div className="flex items-center gap-3">
            {/* sidebar btn (will show up when screen is <lg) */}
            <button
              onClick={() => setSidebarOn(!sidebarOn)}
              className="block lg:hidden hover:text-pink-400 duration-200 text-xl"
            >
              <HiOutlineMenu />
            </button>
          </div>
          <div className="flex justify-evenly gap-2 basis-5/6 sm:basis-3/4 md:basis-1/2 xl:basis-1/3">
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
        </div>
      </header>
      <img src={noActiveChat} className="w-2/3 md:w-1/3" />
      <h1 className="font-bold text-2xl md:text-3xl text-gray-800">
        Go Start a Chat !
      </h1>
      <span className="text-gray-500 font-light text-xs text-center md:text-sm">
        Click one of the available messages or go start a new one by pressing
        the <span className="font-semibold text-gray-600">New Chat</span>{' '}
        button.
      </span>
    </main>
  );
};
